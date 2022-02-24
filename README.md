### timetable-editor
#### Web editor for the Timetable app

This editor was supposed to be a more convenient method for editing the timetable for the Timetable app, but isn't really. Maybe one day.

Usage:
- Unpack the exported `timetable.timetable` file and upload it in the web app or click the `Create new` button and edit the raw JSON.
- To import it into the Timetable app, save the JSON file, and use [plutil](https://github.com/withgraphite/plutil) to convert it back into a `timetable.timetable` file:

  ```
  $ plutil -convert binary1 timetable.json -o timetable.timetable
  ```
