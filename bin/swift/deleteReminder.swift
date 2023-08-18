import Foundation
import EventKit

func deleteReminder(in eventStore: EKEventStore, listName: String, reminderId: String) {
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
            do {
                try eventStore.remove(reminder, commit: true)
                printOk()
            } catch {
                printError("Failed to delete reminder: \(error.localizedDescription)")
            }
        } else {
            printError("Could not find reminder with ID \(reminderId)")
        }
        dispatchGroup.leave()
    }
    dispatchGroup.wait()
}

//Command line arguments handling
let args = CommandLine.arguments

if args.count != 3 {
    printError("Invalid number of arguments. Expected 2, got \(args.count - 1).")
    exit(1)
}

let listName = args[1]
let reminderId = args[2]

deleteReminder(in: EKEventStore(), listName: listName, reminderId: reminderId)
