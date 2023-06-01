import Foundation
import EventKit

func updateReminder(in eventStore: EKEventStore, listName: String, reminderId: String, reminderJson: [String: Any]) {
    let calendars = eventStore.calendars(for: .reminder)

    // Find the calendar with the specified list name
    guard let calendar = calendars.first(where: { $0.title == listName }) else {
        printError("Could not find list with name \(listName)")
        return
    }

    let predicate = eventStore.predicateForReminders(in: [calendar])
    let dispatchGroup = DispatchGroup()
    dispatchGroup.enter()
    eventStore.fetchReminders(matching: predicate) { reminders in
        guard let reminders = reminders else { return }
        if let reminder = reminders.first(where: { $0.calendarItemIdentifier == reminderId }) {
            if let completed = reminderJson["completed"] as? Bool {
                reminder.isCompleted = completed
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
            if let dueDate = reminderJson["dueDate"] as? String, let newDueDate = dateFromString(dueDate) {
                reminder.dueDateComponents = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: newDueDate)
            }
            do {
                try eventStore.save(reminder, commit: true)
                printOk()
            } catch {
                printError("Failed to update reminder: \(error.localizedDescription)")
            }
        } else {
            printError("Could not find reminder with ID \(reminderId)")
        }
        dispatchGroup.leave()
    }
    dispatchGroup.wait()
}

// Command line arguments handling
let args = CommandLine.arguments

if args.count != 4 {
    printError("Invalid number of arguments. Expected 3, got \(args.count - 1).")
    exit(1)
}

let listName = args[1]
let reminderId = args[2]
let reminderJsonData = args[3].data(using: .utf8)!

guard let reminderJson = try? JSONSerialization.jsonObject(with: reminderJsonData, options: []) as? [String: Any] else {
    printError("Invalid JSON format.")
    exit(1)
}

updateReminder(in: EKEventStore(), listName: listName, reminderId: reminderId, reminderJson: reminderJson)
