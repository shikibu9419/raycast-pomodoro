import Foundation
import EventKit

func updateReminder(in eventStore: EKEventStore, reminderId: String, reminderJson: [String: Any]) {
    let calendars = eventStore.calendars(for: .reminder)
    for calendar in calendars {
        let predicate = eventStore.predicateForReminders(in: [calendar])
        let dispatchGroup = DispatchGroup()
        dispatchGroup.enter()
        var reminders: [EKReminder]?
        eventStore.fetchReminders(matching: predicate) { fetchedReminders in
            reminders = fetchedReminders
            dispatchGroup.leave()
        }
        dispatchGroup.wait()

        if let reminder = reminders?.first(where: { $0.calendarItemIdentifier == reminderId }) {
            if let completed = reminderJson["completed"] as? Int {
                reminder.isCompleted = completed == 1
            }
            if let title = reminderJson["title"] as? String {
                reminder.title = title
            }
            if let notes = reminderJson["notes"] as? String {
                reminder.notes = notes
            }
            if let priority = reminderJson["priority"] as? Int {
                reminder.priority = priority
            }
            if let dueDate = reminderJson["dueDate"] as? String, let newDueDate = stringToDate(dueDate) {
                reminder.dueDateComponents = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: newDueDate)
            }
            do {
                try eventStore.save(reminder, commit: true)
                printOk()
                return
            } catch {
                printError("Failed to update reminder: \(error.localizedDescription)")
                return
            }
        }
    }

    printError("Could not find reminder with ID \(reminderId)")
}

// Command line arguments handling
let args = CommandLine.arguments

if args.count != 3 {
    printError("Invalid number of arguments. Expected 2, got \(args.count - 1).")
    exit(1)
}

let reminderId = args[1]
let reminderJson = parseJson(args[2])

updateReminder(in: EKEventStore(), reminderId: reminderId, reminderJson: reminderJson)
