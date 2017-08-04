import React, { Component } from 'react'
import { Select, Icon } from 'antd'
const { Option } = Select

export default class EditableCell extends Component {
  state = {
    value: this.props.value,
    editable: false,
  }

  handleChange = (value) => {
    this.setState({ value });
  }

  edit = () => {
    this.setState({ editable: true });
  }

  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }

  render() {
    const { value, editable } = this.state;
    return (
      <div className="editable-cell">
        {
          editable ?
            <div className="editable-cell-input-wrapper">
              <Select defaultValue={value} onChange={this.handleChange}>
                <Option value="COMMENT">COMMENT</Option>
                <Option value="LIKE">LIKE</Option>
              </Select>
              <Icon
                type="check"
                className="editable-cell-icon-check"
                onClick={this.check}
              />
            </div>
            :
            <div className="editable-cell-text-wrapper">
              {value || ' '}
              <Icon
                type="edit"
                className="editable-cell-icon"
                onClick={this.edit}
              />
            </div>
        }
      </div>
    )
  }
}