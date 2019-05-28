import React, { useContext, useEffect, useReducer, useRef, useState } from 'react'
import './style.scss'

import {
	addYears, addMonths,
	eachDayOfInterval, format,
	startOfWeek, endOfWeek,
	startOfYear, getDaysInMonth,
	getYear, setYear, getMonth, setMonth, getDate,
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

const reducer = (state, action) => {
	const { type, value } = action
	switch (type) {
		case 'setDateFromProps': return {
			...state,
			...dateParser(value),
			update: false,
		}

		case 'setDate': return {
			...state,
			...dateParser(value),
			hours: state.hours,
			minutes: state.minutes,
			update: true,
		}

		case 'setTime': return {
			...state,
			hours: value.hoursValue,
			minutes: value.minutesValue,
			update: true,
		}
		
		case 'setView': return {
			...state,
			update: false,
			view: value,
		}

		default: return state
	}
}

const SetDateContext = React.createContext()

export const SetDate = (props) => {
	const { date, setDate, timeFormat } = props
	const [ newDate, setNewDate ] = useState(date || now)
	const [ waypoint, setWaypoint ] = useState(date || now)
	const [ store, dispatch ] = useReducer(reducer, {
		...dateParser(date || now),
		update: false,
		view: 'dates',
	})
	const { update, view } = store

	useEffect(() => {
		if (newDate !== date) {
			dispatch({ type: 'setDateFromProps', value: date || now })
			setWaypoint(date || now)
		}
	}, [date])

	useEffect(() => {
		const { year, monthIndex, day, hours, minutes, update } = store
		setNewDate(new Date(year, monthIndex, day, hours, minutes))
	}, [store])

	useEffect(() => {
		if (update) {
			setDate(newDate)
		}
	}, [newDate])

	return (
		<SetDateContext.Provider value={{
			newDate, setNewDate, waypoint, setWaypoint, store, dispatch,
		}}>
			<div className="component-set-date">
				<Header />
				{ view === 'dates' &&
					<Dates />
				}
				{ view === 'months' &&
					<Months date={date} />
				}
				{ view === 'years' &&
					<Years date={date} />
				}
				{ view === 'time' &&
					<Time timeFormat={timeFormat || 'HH'} />
				}
				<Footer />
			</div>
		</SetDateContext.Provider>
	)
}

const Header = (props) => {
	const {
		waypoint, setWaypoint, store, dispatch
	} = useContext(SetDateContext)

	const { view } = store

	const heading = {
		dates: format(waypoint, 'MMMM yyyy'),
		months: format(waypoint, 'yyyy'),
		years: 'Years',
		time: format(waypoint, 'MMMM dd, yyyy'),
	}

	const increment = {
		dates: {
			add: () => setWaypoint(addMonths(waypoint, 1)),
			subtract: () => setWaypoint(addMonths(waypoint, -1)),
		},
		months: {
			add: () => setWaypoint(addYears(waypoint, 1)),
			subtract: () => setWaypoint(addYears(waypoint, -1)),
		},
		years: {
			add: () => setWaypoint(addYears(waypoint, 9)),
			subtract: () => setWaypoint(addYears(waypoint, -9)),
		},
	}

	const setView = {
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
						<button onClick={setView[view]}>
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
	const {
		store, dispatch
	} = useContext(SetDateContext)

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
	const {
		newDate, waypoint, dispatch
	} = useContext(SetDateContext)

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
		return isValid(newDate) && format(newDate, 'MMMM dd yyyy') === format(date, 'MMMM dd yyyy')
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
						<button onClick={() => dispatch({ type: 'setDate', value: date })}>
							{getDate(date)}
						</button>
					</li>
				))}
			</ul>
		</main>
	)
}

const Months = (props) => {
	const {
		newDate, waypoint, setWaypoint, dispatch
	} = useContext(SetDateContext)

	const months = Array.from(Array(12).keys()).map(month => {
		return new Date(setMonth(waypoint, month))
	})

	const monthIsCurrent = (date) => {
		return isSameMonth(date, now)
	}

	const monthIsSelected = (date) => {
		// return isValid(newDate) && format(newDate, 'MMMM yyyy') === format(date, 'MMMM yyyy')
		return isValid(waypoint) && format(waypoint, 'MMMM yyyy') === format(date, 'MMMM yyyy')
	}

	const handleSelectMonth = (date) => {
		const monthIndex = getMonth(date)
		setWaypoint(setMonth(waypoint, monthIndex))
		return dispatch({
			type: 'setView',
			value: 'dates',
		})
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
						<button onClick={() => handleSelectMonth(date)}>
							{format(date, 'MMM')}
						</button>
					</li>
				))}
			</ul>
		</main>
	)
}

const Years = (props) => {
	const {
		newDate, waypoint, setWaypoint, dispatch
	} = useContext(SetDateContext)

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
		// return isValid(newDate) && format(newDate, 'yyyy') === format(date, 'yyyy')
		return isValid(waypoint) && format(waypoint, 'yyyy') === format(date, 'yyyy')
	}

	const handleSelectYear = (date) => {
		setWaypoint(setYear(waypoint, getYear(date)))
		return dispatch({
			type: 'setView',
			value: 'months',
		})
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
							<button onClick={() => handleSelectYear(date)}>
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
	const {
		newDate, waypoint, dispatch
	} = useContext(SetDateContext)

	const { timeFormat } = props
	const [ hoursValue, setHoursValue ] = useState(getHours(waypoint))
	const [ minutesValue, setMinutesValue ] = useState(getMinutes(waypoint))

	useEffect(() => {
		return dispatch({ type: 'setTime', value: { hoursValue, minutesValue }})
	}, [hoursValue, minutesValue])

	return (
		<main>
			<ul className="time">
				<li>{format(newDate, timeFormat)}</li>
				<li className="clockColon">:</li>
				<li>{format(newDate, 'mm')}</li>
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

export const InputDate = (props) => {
	const { date, setDate, timeFormat } = props
	const [ fromSetDate, setFromSetDate ] = useState(null)
	const [ value, setValue ] = useState('')
	const [ hasFocus, setHasFocus ] = useState(false)
	const inputDate = useRef()

	const handleOnChange = (e) => {
		e.preventDefault()
		setValue(e.target.value)
		if (isValid(new Date(e.target.value))) {
			setDate(new Date(e.target.value))
		}
	}

	useEffect(() => {
		if (fromSetDate) {
			setDate(fromSetDate)
			setValue(format(fromSetDate, 'MM/dd/yy HH:mm'))
		}
	}, [fromSetDate])

	useOnClickOutside(inputDate, () => setHasFocus(false))

	return (
		<div className="component-input-date" ref={inputDate}>
			<input
				onChange={handleOnChange}
				onFocus={() => setHasFocus(true)}
				placeholder="MM/DD/YY HH:MM"
				type="text"
				value={value}
			/>
			{ hasFocus &&
				<SetDate
					date={isValid(new Date(value)) ? new Date(value) : props.date}
					setDate={setFromSetDate}
					timeFormat={props.timeFormat}
				/>
			}
		</div>
	)
}

function useOnClickOutside(ref, handler) {
  useEffect(
    () => {
      const listener = event => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return
        }

        handler(event)
      }

      document.addEventListener('mousedown', listener)
      document.addEventListener('touchstart', listener)

      return () => {
        document.removeEventListener('mousedown', listener)
        document.removeEventListener('touchstart', listener)
      }
    },
    [ref, handler]
  )
}
