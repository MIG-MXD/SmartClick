import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class SmartClick extends React.Component {
  static defaultProps = {
    disabled: false,
  };

  state = {
    active: false,
  };

  componentDidUpdate() {
    if (this.props.disabled && this.state.active) {
      this.setState({
        active: false,
      });
    }
  }

  onTouchStart = (e) => {
    this.triggerEvent('TouchStart', true, e);
  }

  onTouchMove = (e) => {
    this.triggerEvent('TouchMove', false, e);
  }

  onTouchEnd = (e) => {
    this.triggerEvent('TouchEnd', false, e);
  }

  onTouchCancel = (e) => {
    this.triggerEvent('TouchCancel', false, e);
  }

  onMouseDown = (e) => {
    // pc simulate mobile
    if (this.props.onTouchStart) {
      this.triggerEvent('TouchStart', true, e);
    }
    this.triggerEvent('MouseDown', true, e);
  }

  onMouseUp = (e) => {
    if (this.props.onTouchEnd) {
      this.triggerEvent('TouchEnd', false, e);
    }
    this.triggerEvent('MouseUp', false, e);
  }

  onMouseLeave = (e) => {
    this.triggerEvent('MouseLeave', false, e);
  }

  triggerEvent(type, isActive, ev) {
    const eventType = `on${type}`;
    if (this.props[eventType]) {
      this.props[eventType](ev);
    }
    this.setState({
      active: isActive,
    });
  }
  render() {
    const { children, disabled, enableActive, activeClassName, activeStyle } = this.props;

    const events = disabled ? undefined : {
      onTouchStart: this.onTouchStart,
      onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEnd,
      onTouchCancel: this.onTouchCancel,
      onMouseDown: this.onMouseDown,
      onMouseUp: this.onMouseUp,
      onMouseLeave: this.onMouseLeave,
    };

    const child = React.Children.only(children);

    if (!disabled && this.state.active) {
      let { style, className } = child.props;

      if (enableActive && activeStyle !== false) {
        if (activeStyle) {
          style = { ...style, ...activeStyle };
        }
        className = classnames(className, activeClassName);
      }

      return React.cloneElement(child, {
        className,
        style,
        ...events,
      });
    }

    return React.cloneElement(child, events);
  }
}

SmartClick.defaultProps = {
  disabled: false,
  enableActive: true,
  activeClassName: 'is-active',
};

SmartClick.propTypes = {
  disabled: PropTypes.bool,
  enableActive: PropTypes.bool,
  activeClassName: PropTypes.string,
  activeStyle: PropTypes.string,
  onTouchStart: PropTypes.func,
  onTouchEnd: PropTypes.func,
  onTouchCancel: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onMouseLeave: PropTypes.func,
};
