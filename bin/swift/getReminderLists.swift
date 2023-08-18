import EventKit
import Foundation

func listReminders(from eventStore: EKEventStore) {
    let calendars = eventStore.calendars(for: .reminder)
    let calendarsDict = calendars.map { calendar -> [String: Any] in
        [
            "id": calendar.calendarIdentifier,
            "title": calendar.title
        ]
    }

    do {
        let data = try JSONSerialization.data(withJSONObject: calendarsDict)
        printData(String(data: data, encoding: .utf8) ?? "")
    } catch {
        printError("Failed to encode reminders: \(error).")
    }
}

listReminders(from: EKEventStore())
