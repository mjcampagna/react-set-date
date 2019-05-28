import React, { Fragment, useEffect, useState } from 'react'
import './style.scss'

import {
	addMonths, addYears,
	eachDayOfInterval, endOfWeek, format,

	addSeconds, getSeconds, setSeconds,
	addMinutes, getMinutes, setMinutes,
	addHours, getHours, setHours,
	
	getDate, getDaysInMonth, getMonth, getYear,
	getTime,
	isSameDay, isSameMonth, isSameYear, isValid,
	roundToNearestMinutes,
	startOfWeek, startOfYear,
} from 'date-fns'





const Years = (props) => {
	const { setDate, setView, setWaypoint, waypoint } = props

	const buildYears = (year) => {
		const years = [year]
		for (let i = 1; i < 5; i++) {
			years.push(addYears(new Date(year), i))
			years.unshift(addYears(new Date(year), -i))
		}
		return years
	}
	const years = buildYears(startOfYear(waypoint))

	const dateIsCurrentYear = (year) => {
		return isSameYear(year, new Date())
	}

	const dateIsSelected = (year) => {
		if (isValid(props.date)) {
			return isSameYear(props.date, year)
		}
	}

	const handleClickOnYear = (e, year) => {
		e.preventDefault()
		setDate(null)
		setView('months')
		setWaypoint(year)
	}

	const incrementYears = (amount) => {
		setWaypoint(addYears(waypoint, amount))
	}

	return (
		<Fragment>
			<ul className="calendar-head">
				<li className="prev">
					<button onClick={() => incrementYears(-9)}>-</button>
				</li>
				<li>Years</li>
				<li className="next">
					<button onClick={() => incrementYears(9)}>+</button>
				</li>
			</ul>
			<ul className="calendar-years">
				{ years.map(year => (
					<li
						className={[
							dateIsCurrentYear(year) ? 'today' : undefined,
							dateIsSelected(year) ? 'selected' : undefined,
						].filter(el => el != null).join(' ')}
						key={year}
						onClick={(e) => handleClickOnYear(e, year)}
					>
						{getYear(year)}
					</li>
				))}
			</ul>
		</Fragment>
	)
}





const Months = (props) => {
	const { setDate, setView, setWaypoint, waypoint } = props

	const months = Array.from(Array(12).keys()).map(month => new Date(getYear(waypoint), `${month}`))

	const dateIsCurrentMonth = (month) => {
		return isSameMonth(month, new Date())
	}

	const dateIsSelected = (month) => {
		if (isValid(props.date)) {
			return isSameMonth(props.date, month)
		}
	}

	const handleClickOnMonth = (e, month) => {
		e.preventDefault()
		setDate(null)
		setView('dates')
		setWaypoint(month)
	}

	const incrementYear = (amount) => {
		setWaypoint(addYears(waypoint, amount))
	}

	return (
		<Fragment>
			<ul className="calendar-head">
				<li className="prev">
					<button onClick={() => incrementYear(-1)}>-</button>
				</li>
				<li>
					<button onClick={() => setView('years')}>{format(waypoint, 'yyyy')}</button>
				</li>
				<li className="next">
					<button onClick={() => incrementYear(1)}>+</button>
				</li>
			</ul>
			<ul className="calendar-months">
				{ months.map(month => {
					return (
					<li
						className={[
							dateIsCurrentMonth(month) ? 'today' : undefined,
							dateIsSelected(month) ? 'selected' : undefined,
						].filter(el => el != null).join(' ')}
						key={month}
						onClick={(e) => handleClickOnMonth(e, month)}
					>
						{format(month, 'MMM')}
					</li>
				)})}

			</ul>
		</Fragment>
	)
}





const Dates = (props) => {
	const { setDate, setView, setWaypoint, waypoint } = props

	const calendarSpan = (date) => {
		const year = getYear(date)
		const month = getMonth(date)
		return eachDayOfInterval({
			start: startOfWeek(new Date(year, month, 1), 0),
			end: endOfWeek(new Date(year, month, getDaysInMonth(date)))
		})
	}

	const dates = calendarSpan(waypoint)

	const days = [
		'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
	]

	const dateIsCurrentMonth = (date) => {
		return isSameMonth(date, waypoint)
	}

	const dateIsSelected = (date) => {
		return isValid(props.date) && format(props.date, 'MMMM dd yyyy') === format(date, 'MMMM dd yyyy')
	}

	const dateIsToday = (date) => {
		return isSameDay(date, new Date())
	}

	const handleClickOnDate = (e, date) => {
		e.preventDefault()
		const nextDate = props.date ? keepTime(props.date, date) : date
		if (setDate) {
			setDate(nextDate)
		} else {
			console.warn(
				'To use the selected date, please pass a callback function into the `setDate` prop, accepting `date` as an argument.'
			)
		}
	}

	const incrementMonth = (amount) => {
		setWaypoint(addMonths(waypoint, amount))
	}

	const keepTime = (prevDate, nextDate) => {
		let newDate = nextDate
		newDate = setSeconds(newDate, getSeconds(prevDate))
		newDate = setMinutes(newDate, getMinutes(prevDate))
		newDate = setHours(newDate, getHours(prevDate))
		return newDate
	}

	return (
		<Fragment>
			<ul className="calendar-head">
				<li className="prev">
					<button onClick={() => incrementMonth(-1)}>-</button>
				</li>
				<li>
					<button onClick={() => setView('months')}>{format(waypoint, 'MMMM yyyy')}</button>
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
							dateIsCurrentMonth(date) ? undefined : 'not-this-month',
							dateIsSelected(date) ? 'selected' : undefined,
							dateIsToday(date) ? 'today' : undefined,
						].filter(el => el != null).join(' ')}
						key={date}
						onClick={(e) => handleClickOnDate(e, date)}
					>
						{getDate(date)}
					</li>
				)})}
			</ul>
			<ul className="calendar-foot">
				<li>
					<button onClick={() => setView('time')}>Time</button>
				</li>
			</ul>
		</Fragment>
	)
}





const Time = (props) => {
	const { setDate, setView, setWaypoint, waypoint } = props

	const date = props.date || new Date()

	const hours = 'hh'
	const minutes = 'mm'
	const meridiem = 'a'

	const incrementHours = (amount) => {
		const hours = getHours(date)
		let nextHours

		if (hours + amount > 23) {
			nextHours = setHours(date, 0)
		} else
		if (hours + amount < 0) {
			nextHours = setHours(date, 23)
		} else {
			nextHours = addHours(date, amount)
		}
		setDate(nextHours)
	}

	const incrementMinutes = (amount) => {
		const minutes = getMinutes(date)
		let nextMinutes

		if (minutes + amount > 59) {
			nextMinutes = setMinutes(date, 0)
		} else
		if (minutes + amount < 0) {
			nextMinutes = setMinutes(date, 59)
		} else {
			nextMinutes = addMinutes(date, amount)
		}
		setDate(nextMinutes)
	}

	return (
		<Fragment>
			<ul className="calendar-head">
				<li>
					<button onClick={() => setView('dates')}>
						{format(date, 'MMMM dd, yyyy')}
					</button>
				</li>
			</ul>
			<ul className="calendar-time">
				<li>
					<ul className="adjust-time">
						<li onClick={() => incrementHours(1)}>+</li>
						<li onClick={() => incrementMinutes(1)}>+</li>
						<li onClick={() => null}>+</li>
					</ul>
				</li>

				<li>
					<ul>
						<li>{ format(date, `${hours}`) }</li>
						<li>{ format(date, `${minutes}`) }</li>
						<li>{ format(date, `${meridiem}`) }</li>
					</ul>
				</li>

				<li>
					<ul className="adjust-time">
						<li onClick={() => incrementHours(-1)}>-</li>
						<li onClick={() => incrementMinutes(-1)}>-</li>
						<li onClick={() => null}>-</li>
					</ul>
				</li>
			</ul>
		</Fragment>
	)
}





const Calendar = (props) => {
	const { date, setDate } = props
	const [ view, setView ] = useState('dates')
	const [ waypoint, setWaypoint ] = useState(date || new Date())

	return (
		<div className="component-calendar">
			{ view === 'years' &&
				<Years
					date={roundToNearestMinutes(date)}
					setDate={setDate}
					setView={setView}
					setWaypoint={setWaypoint}
					waypoint={waypoint}
				/>
			}
			{ view === 'months' &&
				<Months
					date={roundToNearestMinutes(date)}
					setDate={setDate}
					setView={setView}
					setWaypoint={setWaypoint}
					waypoint={waypoint}
				/>
			}
			{ view === 'dates' &&
				<Dates
					date={roundToNearestMinutes(date)}
					setDate={setDate}
					setView={setView}
					setWaypoint={setWaypoint}
					waypoint={waypoint}
				/>
			}
			{ view === 'time' &&
				<Time
					date={roundToNearestMinutes(date)}
					setDate={setDate}
					setView={setView}
					setWaypoint={setWaypoint}
					waypoint={waypoint}
				/>
			}
		</div>
	)
}

export default Calendar
