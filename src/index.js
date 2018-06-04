import React from 'react'
import ReactDOM from 'react-dom'
import styles from './styles.css'
import classNames from 'classnames'


const GUTTER = 5

class Point {
  constructor({x, y}) {
    this.x = x
    this.y = y
  }

  add(other) {
    return new Point({x: this.x + other.x, y: this.y + other.y})
  }

  subtract(other) {
    return new Point({x: this.x - other.x, y: this.y - other.y})
  }
}

class Overlay extends React.Component {

  constructor(props) {
    super(props)

    this.mouseDown = this.handleMouseDown.bind(this)
    this.mouseMove = this.handleMouseMove.bind(this)
    this.mouseUp = this.handleMouseUp.bind(this)
    this.fieldFocus = this.handleFieldFocus.bind(this)
    this.fieldChange = this.handleFieldChange.bind(this)
    this.fieldKeyPress = this.handleFieldKeyPress.bind(this)

    // Get state from localStorage or initialize - keyed on url

    this.storageKey = window.location.href
    const previousState = localStorage.getItem(this.storageKey)

    var state = {
      dragging: null, changing: false, start: new Point({x: 50, y: 50}), end: new Point({x: 500, y: 500}),
      mouse: null, rowCount: 8, columnCount: 8, letters: {}
    }
    if (previousState) {
      const existing = JSON.parse(previousState)
      if (existing.start) state.start = new Point(existing.start)
      if (existing.end) state.end = new Point(existing.end)
      if (existing.rowCount) state.rowCount = existing.rowCount
      if (existing.columnCount) state.columnCount = existing.columnCount
      if (existing.letters) state.letters = existing.letters
    }
    this.state = state
  }

  updateState(state) {
    this.setState(state, () => {
      localStorage.setItem(this.storageKey, JSON.stringify(Object.assign({}, this.state, {dragging: false, changing: false})))
    })
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.mouseDown)
    document.addEventListener('mousemove', this.mouseMove)
    document.addEventListener('mouseup', this.mouseUp)
  }

  handleMouseDown(event) {
    if (event.target == this.anchor || event.target == this.drag) {
      this.updateState({ dragging: event.target, mouse: new Point({x: event.clientX, y: event.clientY}) })
      event.preventDefault()
    }
  }

  handleMouseMove(event) {
    if (this.state.dragging) {
      const current = new Point({x: event.clientX, y: event.clientY})
      if (this.state.dragging == this.anchor) {
        this.updateState({
          start: this.state.start.add(current.subtract(this.state.mouse)),
          mouse: current
        })
      } else if (this.state.dragging == this.drag) {
        this.updateState({
          end: this.state.end.add(current.subtract(this.state.mouse)),
          mouse: current
        })
      }
    }
  }

  handleMouseUp(event) {
    this.updateState({ dragging: false })
  }

  handleFieldFocus(event) {
    event.target.select()
  }

  handleFieldKeyPress(event) {
    if (event.keyCode >= 37 && event.keyCode <= 40) {
      event.preventDefault()
    }

    switch(event.keyCode) {
      case 37:
        this.moveCursor(event.target.id, -1, 0)
        break;
      case 38:
        this.moveCursor(event.target.id, 0, -1)
        break;
      case 39:
        this.moveCursor(event.target.id, 1, 0)
        break;
      case 40:
        this.moveCursor(event.target.id, 0, 1)
        break;
    }
  }

  moveCursor(source, x, y) {
    var [targetX, targetY] = this.parseId(source)
    var newX = Math.max(0, Math.min(this.state.columnCount-1, targetX + x))
    var newY = Math.max(0, Math.min(this.state.rowCount-1, targetY + y))
    this.select(newX, newY)
  }

  select(x, y) {
    const target = document.getElementById(this.fieldId(x, y))
    target.focus()
  }

  fieldId(x, y) {
    return `field${x}x${y}`
  }

  parseId(id) {
    var [_, x, y] = id.match(/field(\d+)x(\d+)/)
    return [parseInt(x), parseInt(y)]
  }

  handleFieldChange(event, id) {
    const newValue = event.target.value.toUpperCase()
    event.target.value = newValue
    this.updateState({letters: Object.assign({}, this.state.letters, {[event.target.id]: newValue})})
    event.target.select()
  }

  getValue(id) {
    return this.state.letters[id] || ''
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.mouseDown)
    document.removeEventListener('mousemove', this.mouseMove)
    document.removeEventListener('mouseup', this.mouseUp)
  }

  get left()   { return this.state.start.x }
  get top()    { return this.state.start.y }
  get width()  { return this.state.end.x   }
  get height() { return this.state.end.y   }

  fields() {
    var fields = []
    var width = (this.width - GUTTER) / this.state.columnCount
    var height = (this.height - GUTTER) / this.state.rowCount
    for (var y = 0; y < this.state.rowCount; y++) {
      for (var x = 0; x < this.state.columnCount; x++) {
        var style = {
          left: GUTTER + x * width,
          width: width - GUTTER*2,
          top: GUTTER + y * height,
          height: height - GUTTER*2,
          fontSize: height*0.7
        }
        var id = this.fieldId(x, y)
        fields.push(
          <input
            type="text"
            style={style}
            key={id}
            id={id}
            value={this.getValue(id)}
            className={ styles.field }
            onFocus={ this.fieldFocus }
            onChange={ this.fieldChange }
            onKeyDown={ this.fieldKeyPress }
          />
        )
      }
    }
    return fields
  }

  colrow(change, direction) {
    if (direction == 'vertical') {
      this.updateState({rowCount: this.state.rowCount + change})
    } else {
      this.updateState({columnCount: this.state.columnCount + change})
    }
  }

  changing() {
    return this.state.dragging || this.state.changing
  }

  render() {
    const resize = (style, direction) => {
      return <div
        className={classNames(styles.scaling, style)}
        onMouseOver={event => this.updateState({changing: true})}
        onMouseOut={event => this.updateState({changing: false})}>
        <div onClick={ () => this.colrow(-1, direction) }>–</div>
        <div onClick={ () => this.colrow(1, direction) }>+</div>
      </div>
    }
    let style = { left: this.left, top: this.top, width: this.width, height: this.height }
    return <div className={classNames(styles.wrapper, {[styles.changing]: this.changing()})} style={style}>
      <div ref={(ref) => this.anchor = ref} className={classNames(styles.corner, styles.top, styles.left)}>&#x2630;</div>
      <div ref={(ref) => this.drag = ref} className={classNames(styles.corner, styles.bottom, styles.right)}>⤡</div>
      { resize(styles.bottom_right, 'horizontal') }
      { resize(styles.right_bottom, 'vertical') }
      { this.fields() }
    </div>
  }
}


let overlayId = "wordXerOverlay"

function toggleOverlay() {
  if (active) {
    hideOverlay()
  } else {
    showOverlay()
  }

  active = !active
}

function hideOverlay() {
  document.getElementById(overlayId).remove()
}

function showOverlay() {
  let div = document.createElement('div')
  div.setAttribute("id", overlayId)
  document.body.appendChild(div)
  ReactDOM.render(<Overlay/>, document.getElementById(overlayId))
}

var active = false

if (chrome.runtime) {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (!request) {
        return;
      }
      if (request.action == "status")
        sendResponse({active: active})
      if (request.action == "toggle") {
        toggleOverlay()
        sendResponse({active: active})
      }
      // console.log(sender.tab ?
      //             "from a content script:" + sender.tab.url :
      //             "from the extension", request);
  });
} else {
  // Developer mode
  showOverlay()
}
