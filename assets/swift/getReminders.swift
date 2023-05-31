import EventKit
import Foundation
import Dispatch

func getReminders(in listName: String, from eventStore: EKEventStore, completed: Bool?, startDueDate: Date?, endDueDate: Date?) {
    let calendars = eventStore.calendars(for: .reminder)
    guard let targetCalendar = calendars.first(where: { $0.title == listName }) else {
        printError("The specified list does not exist")
        return
    }

    let predicate = eventStore.predicateForReminders(in: [targetCalendar])

    let group = DispatchGroup()
    group.enter()

    eventStore.fetchReminders(matching: predicate) { reminders in
        defer { group.leave() }

        guard let reminders = reminders else {
            printError("Could not fetch reminders")
            return
        }

        let filteredReminders = reminders.filter { reminder in
            if let dueDate = reminder.dueDateComponents?.date {
                if let startDueDate = startDueDate {
                    if dueDate < startDueDate {
                        return false
                    }
                }
                if let endDueDate = endDueDate {
                    if dueDate > endDueDate {
                        return false
                    }
                }
            }

            if let completed = completed {
                return reminder.isCompleted == completed
            }

            return true
        }.sorted { (a, b) -> Bool in
            // Sort by due date and then by priority
            if a.dueDateComponents?.date != b.dueDateComponents?.date {
                if let dateA = a.dueDateComponents?.date, let dateB = b.dueDateComponents?.date {
                    return dateA > dateB
                } else if a.dueDateComponents?.date != nil {
                    return true
                } else {
                    return false
                }
            } else {
                return a.priority > b.priority
            }
        }

        let remindersDict = filteredReminders.compactMap { reminder -> [String: Any]? in
            let dueDateString = stringFromDate(reminder.dueDateComponents?.date)
            let creationDateString = stringFromDate(reminder.creationDate)
            return [
                "title": reminder.title ?? "",
                "notes": reminder.notes ?? "",
                "id": reminder.calendarItemIdentifier,
                "completed": reminder.isCompleted ? "yes" : "no",
                "creationDate": creationDateString,
                "dueDate": dueDateString,
                "priority": reminder.priority
            ]
        }

        do {
            let data = try JSONSerialization.data(withJSONObject: remindersDict)
            printData(String(data: data, encoding: .utf8) ?? "")
        } catch {
            printError("Failed to encode reminders: \(error)")
        }
    }

    group.wait()
}

// Command line arguments handling
let args = CommandLine.arguments

if args.count < 2 || args.count > 5 {
    printError("Usage: ./<program> <listName> <completed> <startDueDate> <endDueDate>")
    exit(1)
}

let listName     = args[1]
let completed    = args.count >= 3 ? args[2].lowercased() == "true" : nil
let startDueDate = args.count >= 4 ? dateFromString(args[3]) : nil
let endDueDate   = args.count >= 5 ? dateFromString(args[4]) : nil
getReminders(in: listName, from: EKEventStore(), completed: completed, startDueDate: startDueDate, endDueDate: endDueDate)
