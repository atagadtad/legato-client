import React from "react";
import "../App.css";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Nav() {
  const logout = e => {
    e.preventDefault();
    axios(`/api/logout`, {
      withCredentials: true
    }).then(resp => {
      console.log(resp);
    });
  };

  return (
    <nav>
      <Link to="/">
        <h3>Logo</h3>
      </Link>
      <ul className="nav-links">
        <Link to="/students/new">
          <li>New Student</li>
        </Link>
        <Link to="/teachers/new">
          <li>New teacher</li>
        </Link>
        <Link to="/teachers/edit">
          <li>Edit teacher</li>
        </Link>
        <Link to="/students/1">
          <li>Student 1</li>
        </Link>
        <Link to="/teachers/schedule">
          <li>Teacher Schedule</li>
        </Link>
        <Link to="/teachers/schedule/day">
          <li>Teacher Schedule Day</li>
        </Link>
        <Link to="/teachers/6">
          <li>Teacher 6</li>
        </Link>
        <Link to="/login">
          <li>Login</li>
        </Link>
        <Link to="/" onClick={e => logout(e)}>
          <li>Logout</li>
        </Link>
      </ul>
    </nav>
  );
}
