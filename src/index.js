import React from 'react'
import ReactDOM from 'react-dom'
import styles from './styles.css'
import classNames from 'classnames'


class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  add(other) {
    return new Point(this.x + other.x, this.y + other.y)
  }

  subtract(other) {
    return new Point(this.x - other.x, this.y - other.y)
  }
}

class Overlay extends React.Component {

  constructor(props) {
    super(props)

    this.mouseDown = this.handleMouseDown.bind(this)
    this.mouseMove = this.handleMouseMove.bind(this)
    this.mouseUp = this.handleMouseUp.bind(this)
    this.fieldFocus = this.handleFieldFocus.bind(this)
    this.fieldKeyUp = this.handleFieldKeyUp.bind(this)

    this.state = {
      dragging: null, start: new Point(50, 50), end: new Point(500, 500),
      mouse: null, rowCount: 8, columnCount: 8, gutter: 5
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.mouseDown)
    document.addEventListener('mousemove', this.mouseMove)
    document.addEventListener('mouseup', this.mouseUp)
  }

  handleMouseDown(event) {
    if (event.target == this.anchor || event.target == this.drag) {
      this.setState({ dragging: event.target, mouse: new Point(event.clientX, event.clientY) })
      event.preventDefault()
    }
  }

  handleMouseMove(event) {
    if (this.state.dragging) {
      const current = new Point(event.clientX, event.clientY)
      if (this.state.dragging == this.anchor) {
        this.setState({
          start: this.state.start.add(current.subtract(this.state.mouse)),
          mouse: current
        })
      } else if (this.state.dragging == this.drag) {
        this.setState({
          end: this.state.end.add(current.subtract(this.state.mouse)),
          mouse: current
        })
      }
    }
  }

  handleMouseUp(event) {
    this.setState({ dragging: false })
  }

  handleFieldFocus(event) {
    event.target.select()
  }

  handleFieldKeyUp(event) {
    event.target.value = event.target.value.toUpperCase()
    event.target.select()
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
    var width = (this.width - this.state.gutter) / this.state.columnCount
    var height = (this.height - this.state.gutter) / this.state.rowCount
    for (var y = 0; y < this.state.rowCount; y++) {
      for (var x = 0; x < this.state.columnCount; x++) {
        var style = {
          left: this.state.gutter + x * width,
          width: width - this.state.gutter*2,
          top: this.state.gutter + y * height,
          height: height - this.state.gutter*2,
        }
        fields.push(<div className={styles.field} style={style} key={`field-${x}-${y}`}>
          <input style={{fontSize: height}} type="text" onFocus={this.fieldFocus} onKeyUp={this.fieldKeyUp}/>
        </div>)
      }
    }
    return fields
  }

  colrow(change, direction) {
    if (direction == 'vertical') {
      this.setState({rowCount: this.state.rowCount + change})
    } else {
      this.setState({columnCount: this.state.columnCount + change})
    }
  }

  render() {
    const resize = (style, direction) => {
      return <div className={classNames(styles.scaling, style)}>
        <div onClick={ () => this.colrow(-1, direction) }>–</div>
        <div onClick={ () => this.colrow(1, direction) }>+</div>
      </div>
    }
    let style = { left: this.left, top: this.top, width: this.width, height: this.height }
    return <div className={classNames(styles.wrapper, {[styles.dragging]: this.state.dragging})} style={style}>
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

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('request', request)
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
