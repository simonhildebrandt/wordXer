import React from 'react'
import ReactDOM from 'react-dom'
import styles from './styles.css'
import classNames from 'classnames'


class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class Overlay extends React.Component {

  constructor(props) {
    super(props)

    this.mouseDown = this.handleMouseDown.bind(this)
    this.mouseMove = this.handleMouseMove.bind(this)
    this.mouseUp = this.handleMouseUp.bind(this)
    this.fieldFocus = this.handleFieldFocus.bind(this)
    this.fielKeyUp = this.handleFielKeyUp.bind(this)

    this.state = {
      dragging: false, start: new Point(50, 50), end: new Point(500, 500), rowCount: 8, columnCount: 8, gutter: 5
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.mouseDown)
    document.addEventListener('mousemove', this.mouseMove)
    document.addEventListener('mouseup', this.mouseUp)
  }

  handleMouseDown(event) {
    console.log(event, this.anchor, event.target == this.anchor)
    // this.setState({ dragging: true })
    // event.preventDefault()
  }

  handleMouseMove(event) {
    if (this.state.dragging) {

    }
  }

  handleMouseUp(event) {
    this.setState({ dragging: false })
  }

  handleFieldFocus(event) {
  }

  handleFielKeyUp(event) {
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.mouseDown)
    document.removeEventListener('mousemove', this.mouseMove)
    document.removeEventListener('mouseup', this.mouseUp)
  }

  get left()   { return this.state.start.x }
  get top()    { return this.state.start.x }
  get width()  { return this.state.end.x   }
  get height() { return this.state.end.x   }

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
          fontSize: height

        }
        fields.push(<div className={styles.field} style={style} key={`field-${x}-${y}`}>
          <input type="text" onFocus={this.fieldFocus} onKeyUp={this.fieldKeyUp}/>
        </div>)
      }
    }
    return fields
  }

  render() {
    let style = { left: this.left, top: this.top, width: this.width, height: this.height }
    return <div className={classNames(styles.wrapper, {[styles.dragging]: this.state.dragging})} style={style}>
      <div ref={(ref) => this.anchor = ref} className={classNames(styles.corner, styles.top, styles.left)}>&#x2630;</div>
      <div ref={(ref) => this.drag = ref} className={classNames(styles.corner, styles.bottom, styles.right)}>⤡</div>

      { this.fields() }
    </div>
  }
}

let name = "wordXerOverlay"
let div = document.createElement('div')
div.setAttribute("id", name);
document.body.append(div)
ReactDOM.render(<Overlay/>, document.getElementById(name))
