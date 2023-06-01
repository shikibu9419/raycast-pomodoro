import Foundation
import EventKit

func createReminder(in eventStore: EKEventStore, listName: String, title: String, notes: String, dueDate: String, priority: Int) {
    guard let calendar = eventStore.calendars(for: .reminder).first(where: { $0.title == listName }) else {
        printError("List with name \(listName) not found.")
        return
    }

    let reminder = EKReminder(eventStore: eventStore)
    reminder.title = title
    reminder.notes = notes
    reminder.calendar = calendar

    // Parse the date
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    if let date = formatter.date(from: dueDate) {
        let components = Calendar.current.dateComponents([.year, .month, .day], from: date)
        reminder.dueDateComponents = components
    }

    reminder.priority = priority

    do {
        try eventStore.save(reminder, commit: true)

        let reminderDict: [String: Any] = [
            "title": reminder.title ?? "",
            "notes": reminder.notes ?? "",
            "id": reminder.calendarItemIdentifier,
            "completed": reminder.isCompleted,
            "creationDate": stringFromDate(reminder.creationDate),
            "dueDate": stringFromDate(reminder.dueDateComponents?.date),
            "priority": reminder.priority
        ]
        let data = try JSONSerialization.data(withJSONObject: reminderDict)

        printData(String(data: data, encoding: .utf8) ?? "")
    } catch let error {
        printError("Reminder failed with error \(error.localizedDescription)")
    }
}

// Command line arguments handling
let args = CommandLine.arguments

if args.count != 6 {
    printError("Usage: ./<program> <listName> <title> <notes> <dueDate> <priority>")
    exit(1)
}

let listName = args[1]
let title = args[2]
let notes = args[3]
let dueDate = args[4]
let priority = Int(args[5]) ?? 0

createReminder(in: EKEventStore(), listName: listName, title: title, notes: notes, dueDate: dueDate, priority: priority)
