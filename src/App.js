import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";

import RunPage from "./Containers/RunPage";
import SignUpForm from "./Components/SignUpForm";
import LogInForm from "./Components/LogInForm";
import WelcomePage from "./Containers/WelcomePage";
import CirclePage from "./Containers/CirclePage";
import Stats from "./Containers/Stats";

import "./App.css";

const baseUrl = "http://localhost:3000/";

export default function App() {
  const [user, setUser] = useState({});
  const [error, setError] = useState("");

  const [runs, setRuns] = useState([]);
  const [myRuns, setMyRuns] = useState([]);

  const [circles, setCircles] = useState([]);
  const [myCircles, setMyCircles] = useState([]);

  const signUp = (user) => {
    fetch(baseUrl + "users", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          username: user.username,
          password: user.password,
        },
      }),
    })
      .then((response) => response.json())
      .then((user) => setUser({ user }));
  };

  const login = (username, password) => {
    fetch(baseUrl + "login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          username,
          password,
        },
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.token) {
          localStorage.setItem("token", result.token);
          setUser(result.user);
        } else {
          setError(result.error);
        }
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser({});
  };

  const validateUser = () => {
    let token = localStorage.getItem("token");
    if (token) {
      fetch(baseUrl + "profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.id) {
            setUser(result);
          }
        });
    }
  };

  const removeMyCircle = (myCircleToRemove) => {
    console.log("removing my circle...");
    let filteredCircles = myCircles.filter((myCircle) => {
      return myCircle !== myCircleToRemove;
    });
    setMyCircles(filteredCircles);
  };

  const removeMyRun = (myRunToRemove) => {
    console.log("removing my run...");
    let filteredRuns = myRuns.filter((myRun) => {
      return myRun !== myRunToRemove;
    });
    setMyRuns(filteredRuns);
  };

  const deleteRun = (runToDelete) => {
    console.log("deleting run...");

    let token = localStorage.getItem("token");
    let filteredRuns = runs.filter((run) => {
      return run !== runToDelete;
    });
    setRuns(filteredRuns);

    let filteredMyRuns = myRuns.filter((myRun) => {
      return myRun !== runToDelete;
    });
    setMyRuns(filteredMyRuns);

    fetch(baseUrl + "runs/" + runToDelete.id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then(console.log);
  };

  useEffect(() => {
    validateUser();
  }, []);

  return (
    <div className="App">
      <Router>
        {/* <header> */}
        <Navbar expand="lg" sticky="top" id="nav-bar">
          {/* <Link to="/" className="nav-link">
              <h1 id="logo">RUNNING CIRCLES</h1>
            </Link> */}
          <Navbar.Brand id="logo" href="/">
            RUNNING CIRCLES
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="/run" id="nav-link">
                Run
              </Nav.Link>
              <Nav.Link id="nav-link" href="/circles">
                Circles
              </Nav.Link>
              <Nav.Link id="nav-link" href="/stats">
                Stats
              </Nav.Link>
              <Nav.Link id="nav-link" href="/" onClick={logout}>
                Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <main>
          <Switch>
            <Route path="/run">
              <RunPage
                validateUser={validateUser}
                runs={runs}
                setRuns={setRuns}
                myRuns={myRuns}
                setMyRuns={setMyRuns}
                removeMyRun={removeMyRun}
                deleteRun={deleteRun}
              />
            </Route>
            <Route path="/circles">
              <CirclePage
                validateUser={validateUser}
                myCircles={myCircles}
                circles={circles}
                setCircles={setCircles}
                setMyCircles={setMyCircles}
                removeMyCircle={removeMyCircle}
              />
            </Route>
            <Route path="/stats">
              {user.username ? (
                <Stats
                  validateUser={validateUser}
                  user={user}
                  myRuns={myRuns}
                  myCircles={myCircles}
                  removeMyRun={removeMyRun}
                  removeMyCircle={removeMyCircle}
                />
              ) : null}
            </Route>
            <Route path="/">
              <div className="main-container">
                {user.username ? (
                  <>
                    <WelcomePage user={user} />
                  </>
                ) : (
                  <>
                    <SignUpForm signUp={signUp} />
                    <LogInForm login={login} error={error} />
                  </>
                )}
              </div>
            </Route>
          </Switch>
        </main>
        <footer className="footer">
          <p>Copyright 2021 Running Circles. All rights reserved.</p>
        </footer>
      </Router>
    </div>
  );
}
