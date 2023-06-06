import EventKit
import Foundation
import Dispatch

func getReminders(in eventStore: EKEventStore, with params: [String: Any]) {
    let calendars = eventStore.calendars(for: .reminder)
    var targetCalendars: [EKCalendar] = []

    if let listName = params["listName"] as? String, !listName.isEmpty {
        guard let targetCalendar = calendars.first(where: { $0.title == listName }) else {
            printError("The specified list does not exist")
            return
        }
        targetCalendars.append(targetCalendar)
    } else {
        targetCalendars = calendars
    }

    let predicate = eventStore.predicateForReminders(in: targetCalendars)

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
                if let startDueDate = params["startDueDate"] as? Date {
                    if dueDate < startDueDate {
                        return false
                    }
                }
                if let endDueDate = params["endDueDate"] as? Date {
                    if dueDate > endDueDate {
                        return false
                    }
                }
            }

            if let completed = params["completed"] as? Bool {
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
            return [
                "title": reminder.title ?? "",
                "notes": reminder.notes ?? "",
                "id": reminder.calendarItemIdentifier,
                "completed": reminder.isCompleted,
                "creationDate": dateToString(reminder.creationDate),
                "dueDate": dateToString(reminder.dueDateComponents?.date),
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

if args.count > 2 {
    printError("Usage: ./<program> <parameter json>")
    exit(1)
}

getReminders(in: EKEventStore(), with: parseJson(args[1]))
