import React, { useState } from 'react'
import { render } from 'react-dom'
import 'normalize.css'
import './sass/main.scss'

import { InputDate, SetDate } from './SetDate'

const App = () => {
  const startDate = new Date()
  startDate.setHours(0)
  startDate.setMinutes(0)
  startDate.setSeconds(0)

  const [date, setDate] = useState(null)

  return (
    <div>
      <h1>React SetDate</h1>

      <p style={{
        padding: '6px 13px',
        padding: '0 0 12px',
				// transform: 'scaleY(-1)',
			}}>
        {date && date.toString() || '...'}
      </p>

      <InputDate
        date={date}
        setDate={setDate}
        timeFormat="hh" // h, hh, H, HH
        value={date}
      />

      {/* <SetDate
        date={date}
        setDate={setDate}
        timeFormat="hh" // h, hh, H, HH
      /> */}

    </div>
  )
}

render(<App />, document.getElementById('app'))
