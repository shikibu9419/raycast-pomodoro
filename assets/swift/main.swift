import EventKit

ReminderAuthorization().askForPermission {
    let eventStore = EKEventStore()
    createReminder(in: eventStore)
}


// switch EKEventStore.authorizationStatus(for: .reminder) {
// case .authorized:
//     createReminder(in: eventStore)
// case .denied:
//     print("Access to reminders is denied.")
// default:
//     print("Access to reminders is not determined.")
// }

func createReminder(in eventStore: EKEventStore) {
    print("createeee");
    let reminder = EKReminder(eventStore: eventStore)
    reminder.title = "Title"
    reminder.notes = "Notes"
    reminder.calendar = eventStore.defaultCalendarForNewReminders()

    do {
        try eventStore.save(reminder, commit: true)
    } catch let error {
        print("Reminder failed with error \(error.localizedDescription)")
    }
    print("done");
}
