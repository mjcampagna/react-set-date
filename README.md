# React SetDate

A date-picker in React, comprised of functional components, and using [React Hooks](https://reactjs.org/docs/hooks-intro.html) and [date-fns](https://date-fns.org).

Because I don't like the other date-pickers I've seen.

```js
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
      date={date}
      setDate={setDate}
    />
  )
}
```
