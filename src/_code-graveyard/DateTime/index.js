import React, { useEffect, useReducer, useRef, useState } from 'react'
import './style.scss'

import {
	addMonths,
	eachDayOfInterval, endOfWeek, format,

	getSeconds, setSeconds,
	getMinutes, setMinutes,
	getHours, setHours,
	
	getDate, getDaysInMonth, getMonth,
	getTime,
	getYear, isSameMonth, isValid, lastDayOfMonth, startOfWeek
} from 'date-fns'





const Dates = (props) => {
	const now = new Date()
	const [displayedDate, setDisplayedDate] = useState(props.date || now)

	const days = [
		'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
	]

	useEffect(() => {
		console.log(props.date)
	}, [props.date])

	const firstOfMonth = new Date(getYear(displayedDate), getMonth(displayedDate), 1)

	const calendarFirst = startOfWeek(firstOfMonth, 0)
	const calendarLast = endOfWeek(new Date(getYear(displayedDate), getMonth(displayedDate), getDaysInMonth(displayedDate)))

	const dates = eachDayOfInterval({
		start: new Date(calendarFirst),
		end: new Date(calendarLast),
	})
	
	const handleClickOnDate = (e, date) => {
		e.preventDefault()
		props.onDateChange(date)
	}

	const incrementMonth = (amount) => {
		setDisplayedDate(addMonths(displayedDate, amount))
	}

	const updateDate = (prevDate, nextDate) => {
		let newDate = nextDate
		newDate = setSeconds(newDate, getSeconds(prevDate))
		newDate = setMinutes(newDate, getMinutes(prevDate))
		newDate = setHours(newDate, getHours(prevDate))
		return newDate
	}

	return (
		<div className="component-calendar">
			<ul className="calendar-head">
				<li className="prev">
					<button onClick={() => incrementMonth(-1)}>-</button>
				</li>
				<li>
					{format(displayedDate, 'MMMM yyyy')}
				</li>
				<li className="next">
					<button onClick={() => incrementMonth(1)}>+</button>
				</li>
			</ul>
			<ul className="calendar-days">
				{ days.map(day => (
					<li key={day}>{day.slice(0, 1)}</li>
				))}
			</ul>
			<ul className="calendar-dates">
				{ dates.map(date => {
					return (
					<li
						className={[
							isValid(props.date) && format(props.date, 'MMMM dd yyyy') === format(date, 'MMMM dd yyyy') ? 'selected' : undefined,
							isSameMonth(date, displayedDate) ? undefined : 'not-this-month',
						].filter(el => el != null).join(' ')}
						key={date}
						onClick={(e) => handleClickOnDate(e, date)}
					>
						{getDate(date)}
					</li>
				)})}
			</ul>
		</div>
	)
}





const Calendar = (props) => {
	return (
		<div className="component-calendar">
		
		</div>
	)
}





const DateTime = (props) => {
	const dateTimeInput = useRef()
	const [ value, setValue ] = useState('')
	
	const handleOnChange = (e) => {
		e.preventDefault()
		setValue(e.target.value)
	}

	const handleDateChange = (nextDate) => {
		setValue(format(nextDate, 'MMMM dd, yyyy'))
	}

	return (
		<div className="component-date-time">
			<input
				onChange={handleOnChange}
				ref={dateTimeInput}
				type="text"
				value={value}
			/>

			<p style={{
				padding: '6px 13px',
				// transform: 'scaleY(-1)',
			}}>
				{isValid(new Date(value)) ? new Date(value).toString() : value}
			</p>

			<Dates
				date={isValid(new Date(value)) ? new Date(value) : null}
				onDateChange={handleDateChange}
			/>
		</div>
	)
}

export default DateTime
