import React, { useEffect, useReducer, useRef, useState } from 'react'
import './style.scss'

// ref: https://glennmccomb.com/articles/building-a-pure-css-animated-svg-spinner/

const Loading = (props) => (
	<svg className="component-loading" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
		<circle cx="50" cy="50" r="45"/>
	</svg>
)

export default Loading
