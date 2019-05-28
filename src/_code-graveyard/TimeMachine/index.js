import React, { useContext, useEffect, useReducer, useState } from 'react'
import './style.scss'

import {
	addYears,
	eachDayOfInterval, format,
	startOfWeek, endOfWeek,
	startOfYear, getDaysInMonth,
	getYear, getMonth, getDate,
	getHours, getMinutes,
	isSameYear, isSameMonth, isSameDay,
	isValid,
} from 'date-fns'

const now = new Date()

const dateParser = (date) => ({
	year: getYear(date),
	monthIndex: getMonth(date),
	day: getDate(date),
	hours: getHours(date),
	minutes: getMinutes(date),
})

const dateReducer = (state, action) => {
	const { type, value } = action
	switch (type) {
		case 'incrementMonths':
			return {
				...state,
				monthIndex: (Number(state.monthIndex) + value).toString(),
				update: false,
			}

		case 'incrementYears':
			return {
				...state,
				year: (Number(state.year) + value).toString(),
				update: false,
			}

		case 'setDate':
			return {
				...state,
				...dateParser(value),
				hours: state.hours,
				minutes: state.minutes,
				update: true,
			}

		case 'setMonth':
			return {
				...state,
				monthIndex: value,
				view: 'dates',
				update: true,
			}

		case 'setYear':
			return {
				...state,
				year: value,
				view: 'months',
				update: true,
			}

		case 'setTime':
			return {
				...state,
				hours: value.hoursValue,
				minutes: value.minutesValue,
				update: true,
			}

		case 'setView':
			return {
				...state,
				view: value,
				update: false,
			}

		default:
			return state
	}
}

const TimeMachineContext = React.createContext()

const TimeMachine = (props) => {
	const { date, setDate, timeFormat } = props
	const [ waypoint, setWaypoint ] = useState(date)
	const [ store, dispatch ] = useReducer(dateReducer, {
		...dateParser(date),
		view: 'dates',
		update: false,
	})

	useEffect(() => {
		const { year, monthIndex, day, hours, minutes, update } = store
		const newDate = new Date(year, monthIndex, day, hours, minutes)
		if (isValid(newDate)) {
			setWaypoint(newDate)
			if (update) {
				setDate(newDate)
			}
		}
	}, [store])

	return (
		<TimeMachineContext.Provider value={{
			date, dispatch, setWaypoint, store, waypoint,
		}}>
			<div className="component-time-machine">
				<Header />
				{ store.view === 'dates' &&
					<Dates date={date} />
				}
				{ store.view === 'months' &&
					<Months date={date} />
				}
				{ store.view === 'years' &&
					<Years date={date} />
				}
				{ store.view === 'time' &&
					<Time timeFormat={timeFormat || 'HH'} />
				}
				<Footer />
			</div>
		</TimeMachineContext.Provider>
	)
}

export default TimeMachine

const Header = (props) => {
	const { dispatch, store, waypoint } = useContext(TimeMachineContext)
	const { view } = store

	const heading = {
		dates: format(waypoint, 'MMMM yyyy'),
		months: format(waypoint, 'yyyy'),
		years: 'Years',
		time: format(waypoint, 'MMMM dd, yyyy'),
	}

	const increment = {
		dates: {
			add: () => dispatch({ type: 'incrementMonths', value: 1 }),
			subtract: () => dispatch({ type: 'incrementMonths', value: -1 })
		},
		months: {
			add: () => dispatch({ type: 'incrementYears', value: 1 }),
			subtract: () => dispatch({ type: 'incrementYears', value: -1 })
		},
		years: {
			add: () => dispatch({ type: 'incrementYears', value: 9 }),
			subtract: () => dispatch({ type: 'incrementYears', value: -9 })
		},
	}

	const changeView = {
		dates: () => dispatch({ type: 'setView', value: 'months'}),
		months: () => dispatch({ type: 'setView', value: 'years'}),
		time: () => dispatch({ type: 'setView', value: 'dates'}),
	}

	return (
		<header>
			<ul>
				{ view !== 'time' &&
					<li className="prev">
						<button onClick={increment[view].subtract}>-</button>
					</li>
				}
				<li className="">
					{ view === 'years' ? heading[view] :
						<button onClick={changeView[view]}>
							{heading[view]}
						</button>
					}
				</li>
				{ view !== 'time' &&
					<li className="next">
						<button onClick={increment[view].add}>+</button>
					</li>
				}
			</ul>
		</header>
	)
}

const Footer = (props) => {
	const { dispatch, store, waypoint } = useContext(TimeMachineContext)
	const { view } = store

	return (
		<footer>
			<ul>
				{ view !== 'time' &&
					<li>
						<button onClick={() => dispatch({ type: 'setView', value: 'time'})}>
							Set Time
						</button>
					</li>
				}
			</ul>
		</footer>
	)
}

const Dates = (props) => {
	const { waypoint, dispatch } = useContext(TimeMachineContext)

	const daysOfWeek = eachDayOfInterval({
		start: startOfWeek(now),
		end: endOfWeek(now),
	})
	.reduce((acc, date) => {
		acc.push(format(date, 'EEEE'))
		return acc
	}, [])

	const datesSpan = (baseDate) => {
		const [year, month] = [getYear(baseDate), getMonth(baseDate)]
		return eachDayOfInterval({
			start: startOfWeek(new Date(year, month, 1), 0),
			end: endOfWeek(new Date(year, month, getDaysInMonth(waypoint)))
		})
	}

	const dateIsCurrent = (date) => {
		return isSameDay(date, now)
	}
		
	const dateIsSelected = (date) => {
		return isValid(props.date) && format(props.date, 'MMMM dd yyyy') === format(date, 'MMMM dd yyyy')
	}

	const monthIsCurrent = (date) => {
		return isSameMonth(date, waypoint)
	}

	return (
		<main>
			<ul className="days-of-the-week">
				{ daysOfWeek.map(day => (
					<li key={day}>{day.slice(0, 2)}</li>
				))}
			</ul>

			<ul className="dates">
				{ datesSpan(waypoint).map(date => (
					<li
						className={[
							dateIsCurrent(date) ? 'current' : undefined,
							monthIsCurrent(date) ? undefined : 'not-current-month',
							dateIsSelected(date) ? 'selected' : undefined,
						].filter(el => el != null).join(' ')}
						key={date}
					>
						<button
							onClick={() => dispatch({ type: 'setDate', value: date })}
						>{getDate(date)}</button>
					</li>
				))}
			</ul>
		</main>
	)
}

const Months = (props) => {
	const { waypoint, dispatch } = useContext(TimeMachineContext)
	const months = Array.from(Array(12).keys()).map(month => new Date(getYear(waypoint), `${month}`))

	const monthIsCurrent = (date) => {
		return isSameMonth(date, now)
	}

	const monthIsSelected = (date) => {
		return isValid(props.date) && format(props.date, 'MMMM yyyy') === format(date, 'MMMM yyyy')
	}

	return (
		<main>
			<ul className="months">
				{ months.map(date => (
					<li
						className={[
							monthIsCurrent(date) ? 'current' : undefined,
							monthIsSelected(date) ? 'selected' : undefined,
						].filter(el => el != null).join(' ')}
						key={date}
					>
						<button onClick={() => dispatch({
							type: 'setMonth',
							value: getMonth(date),
						})}>
							{format(date, 'MMM')}
						</button>
					</li>
				))}
			</ul>
		</main>
	)
}

const Years = (props) => {
	const { waypoint, dispatch } = useContext(TimeMachineContext)

	const buildYears = (year) => {
		const years = [year]
		for (let i = 1; i < 5; i++) {
			years.push(addYears(new Date(year), i))
			years.unshift(addYears(new Date(year), -i))
		}
		return years
	}
	const years = buildYears(startOfYear(waypoint))

	const yearIsCurrent = (date) => {
		return isSameYear(date, now)
	}

	const yearIsSelected = (date) => {
		return isValid(props.date) && format(props.date, 'yyyy') === format(date, 'yyyy')
	}

	return (
		<main>
			<ul className="years">
				{ years.map(date => {
					const year = getYear(date)
					return (
						<li
							className={[
								yearIsCurrent(date) ? 'current' : undefined,
								yearIsSelected(date) ? 'selected' : undefined,
							].filter(el => el != null).join(' ')}
							key={year}
						>
							<button onClick={() => dispatch({
								type: 'setYear',
								value: year,
							})}>
								{year}
							</button>
						</li>
					)
				})}
			</ul>
		</main>
	)
}

const Time = (props) => {
	const { timeFormat } = props
	const { waypoint, dispatch } = useContext(TimeMachineContext)
	const [ hoursValue, setHoursValue ] = useState(getHours(waypoint))
	const [ minutesValue, setMinutesValue ] = useState(getMinutes(waypoint))

	useEffect(() => {
		return dispatch({ type: 'setTime', value: { hoursValue, minutesValue }})
	}, [hoursValue, minutesValue])

	return (
		<main>
			<ul className="time">
				<li>{format(waypoint, timeFormat)}</li>
				<li className="clockColon">:</li>
				<li>{format(waypoint, 'mm')}</li>
				{ (timeFormat === 'hh' || timeFormat === 'h') &&
					<li className="meridiem">{hoursValue < 12 ? 'AM' : 'PM'}</li>
				}
			</ul>
			<ul className="timeSliders">
				<li>
					<label>Hours</label>
					<input
						min="0"
						max="23"
						name="hours"
						onChange={(e) => setHoursValue(e.target.value)}
						type="range"
						value={hoursValue}
					/>
				</li>
				<li>
					<label>Minutes</label>
					<input
						min="0"
						max="59"
						name="mins"
						onChange={(e) => setMinutesValue(e.target.value)}
						step="5"
						type="range"
						value={minutesValue}
					/>
				</li>
			</ul>
		</main>
	)
}
