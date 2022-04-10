import React from 'react';
import { Link } from "react-router-dom";

function ReloadLogin() {
  return (
    <div style={{textAlign:'center'}}>
        <span>Changing to other Metamask account?</span>
        <br/>
        <Link to="/">
            <span>Please click here to login</span>
        </Link>
    </div>
  )
}

export default ReloadLogin