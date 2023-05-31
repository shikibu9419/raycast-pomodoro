import Foundation
import EventKit

func createReminder(in eventStore: EKEventStore, title: String, notes: String, dueDate: String, priority: Int, listName: String) {
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
        printOk()
    } catch let error {
        printError("Reminder failed with error \(error.localizedDescription)")
    }
}

// Command line arguments handling
let args = CommandLine.arguments

if args.count != 6 {
    printError("Usage: ./<program> <title> <notes> <dueDate> <priority> <listName>")
    exit(1)
}

let title = args[1]
let notes = args[2]
let dueDate = args[3]
let priority = Int(args[4]) ?? 0
let listName = args[5]

createReminder(in: EKEventStore(), title: title, notes: notes, dueDate: dueDate, priority: priority, listName: listName)
