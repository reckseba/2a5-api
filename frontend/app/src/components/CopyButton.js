import React from 'react';

class CopyButton extends React.Component {
  
    copyCodeToClipboard() {
        const el = document.getElementById('result');
        el.select();
        document.execCommand("copy");
    }

    render() {
        return (
            <button onClick={this.copyCodeToClipboard}>Copy</button>
        );
    }

}

export default CopyButton