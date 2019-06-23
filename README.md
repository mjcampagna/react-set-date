# React SetDate

![npm (scoped)](https://img.shields.io/npm/v/@slithyme/react-set-date.svg)

React Set Date is a flat, flexible date-picker in React, built of functional components using [React Hooks](https://reactjs.org/docs/hooks-intro.html) and [date-fns](https://date-fns.org).

Because I don't like the other date-pickers I've seen.

----

[Code Sandbox](https://codesandbox.io/s/reactsetstate-xw1kw)

React SetDate returns a standard JavaScript Date object; do as you like with it.

Use `SetDate` to display the picker on the page, or include the picker in a wrapper component.

Use `InputDate` to display an input that opens the date-picker on focus.

```js
// Use in a functional component, with hooks:

import { InputDate, SetDate } from './SetDate'

const App = (props) => {

  // Optionally, supply a start date; if none, gallery will default to `new Date()`
  const startDate = new Date()
  startDate.setHours(0)
  startDate.setMinutes(0)
  startDate.setSeconds(0)

  // To get the date out of the component, supply a handler
  const [date, setDate] = useState(startDate)
  useEffect(() => {
    // do something with the date, i.e.
    console.log(date)
  }, [date])

  return (
    <SetDate
      date={date} // optional
      setDate={setDate} // required
      timeFormat="hh" // h, hh, H, HH (optional; HH by default)
    />
  )
}
```

```js
// Use in a class-based component

import { InputDate, SetDate } from './SetDate'

class App extends React.Component {
  state = {
    date: new Date(),
  }

  // provide a handler that does something with the date
  handleSetDate = (date) => {
    this.setState({
      date,
    }, () => {
      console.log(date)
    })
  }

  render() {
    return (
      <SetDate
        date={date} // optional
        setDate={handleSetDate} // required
        timeFormat="hh" // h, hh, H, HH (optional; HH by default)
      />
    )
  }
}
```
