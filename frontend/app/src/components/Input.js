import React from 'react';
import axios from 'axios';

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {

    const payload = {urlLong: this.state.value}

    if(payload.urlLong && payload.urlLong.length > 0) {

      // do the post request
      axios.post('/newUrlLong', payload)
        .then(res => {
          // when success

          // check if there is content
          if(res.data) {
            // yes there is

            if(res.data.error && res.data.error.length > 0) {
              // whoops there is an error

              // tell the user what it is
              alert(res.data.error);
            } else {

              // there we go. Everything's fine
              // console.log(res.data);

              document.getElementById('result').value = res.data.urlShortFull;

              document.getElementById('resultlink').href = res.data.urlShortFull;
              
              document.getElementById('qrcode').src = res.data.urlQrCode;

              document.getElementById('results').classList.add('show');
              
            }

          } else {
            // unfortunately no content
            console.log('Success request but no content sent.');
          }
        })
        .catch(err => alert(err.error))

    } else {
      alert('input field required');
    }

    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" value={this.state.value} onChange={this.handleChange} />
        <input type="submit" value="Shorten" />
      </form>
    );
  }

}

export default Input