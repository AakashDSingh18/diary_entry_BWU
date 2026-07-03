import React, { useState, useEffect } from 'react';
import './App.css';
import diaryImage from './diary.png';

function App(){
  const [user, setuser] = useState(null);
  const [regis, setregis] = useState(false);
  const [entries, setentries] = useState([]);
  const [logged, setlogged] = useState(false);
  const [registered, setregistered] = useState(false);
  const [sidebar, setsidebar] = useState(false);
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');
  const [title, settitle] = useState('');
  const [content, setcontent] = useState('');
  const [editId, setEditId] = useState(null);
  
  const handleAuth = async function() {
    const endpoint = regis ? "/register" : "/login";
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if(data.userId){
      setTimeout(function(){
        setuser(data.userId);
      }, 2000);
      if(regis) setregistered(true);
      else setlogged(true);
    }else{
      alert(data.message);
    }
  };

  const fetchEntries = async function(){
    if (!user) return;
    const res = await fetch(`/${user}/entries`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    setentries(data.entries);
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const saveEntry = async () => {
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/${user}/entries/editentry/${editId}` : `/${user}/entries/newentry`;
    await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });
    settitle('');
    setcontent('');
    setEditId(null);
    fetchEntries();
  };

  const deleteEntry = async (id) => {
      await fetch(`/entries/${id}`, { method: 'DELETE' });
      fetchEntries();
  };

  const startEdit = (entry) => {
    setEditId(entry.editId);
    settitle(entry.title);
    setcontent(entry.content);
  };

  const logout = () => {
    setuser(null);
    setusername('');
    setPassword('');
  };
  
  if (!user) {
    return (
      <div className="container">
        <div className="top"></div>
        <div className="bottom"></div>
        <div className="center">
          <h2>{regis ? "Create Account" : "Please Sign In"}</h2>
          <input type="text" placeholder="Username" 
            value={username} 
            onChange={function(e) {
              setusername(e.target.value)
            }} 
          />
          <input type="password" placeholder="Password" 
            value={password} 
            onChange={function(e) { 
              setPassword(e.target.value)
            }} 
          />
          
          <button className="entry" onClick={handleAuth}>
            {regis ? "Sign Up" : "Login"}
          </button>
          
          <p onClick={function() {
            setregis(!regis)
            }} style={{cursor:'pointer', color:'blue'}}>
              {regis ? "Already have an account? Login" : "New here? Register"}
          </p>
          <p style={{color:'green', fontSize:'14px', fontWeight:'bold'}}> 
            {logged ? "Logging in..." : registered ? "Registered successfully!!" : ""} </p>
        </div>
      </div>
    );
  }else {
    return (
      <>
        <div className={`sidebar ${sidebar ? 'open' : ''}`}>
          <div className="sidebarnav">
            <h3>Previous Thoughts</h3>
            <button onClick={() => setsidebar(false)} style={{padding: '5px 5px', background: '#f44336', color: 'white', borderRadius: '4px', cursor: 'pointer', height: '100%', width: '10%'}}>✖</button>
          </div>
          {entries.length === 0 ? <p>No entries yet. Start writing!</p> : (
            entries.map(item => (
              <div key={item.editId} className="entry-card">
                <div className="timestamp"> <p style={{margin: '0 0 5px 0', fontSize: '12px', color: '#666'}}>{item.date}  :   {item.time}</p> </div>
                <h4 style={{margin: '0 0 10px 0'}}>{item.title}</h4>
                <p style={{fontSize: '14px', overflowWrap:'break-word'}}>{item.content}</p>
                <div className="sidebar-buttons">
                  <button className="btn-edit" onClick={() => { startEdit(item); setsidebar(false); }}>Edit</button>
                  <button className="btn-danger" onClick={() => deleteEntry(item.editId)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="dashboard">
          <div className="nav">
            <div style={{display: 'flex', alignItems: 'center', padding: 0}}>
              <button className="menu-btn" onClick={() => setsidebar(true)}><img src={diaryImage} alt="arrow" style={{height:'24px', width:'24px'}}></img></button>
              <h2 style={{backgroundColor:"#f6eee3"}}>Thought Book</h2>
            </div>
            <button className="btn-danger" onClick={logout}>Logout</button>
          </div>
          <div className="diary-section">
            <h3>{editId ? "Edit Thought" : "New Thought"}</h3>
            <input 
              placeholder="Title" 
              value={title} 
              onChange={(e) => settitle(e.target.value)} 
            />
            <textarea 
              placeholder="share your thoughts..." 
              rows="6" 
              value={content} 
              onChange={(e) => setcontent(e.target.value)}
            ></textarea>
            <button className="btn-primary" onClick={saveEntry}>
              {editId ? "Update Entry" : "Save Entry"}
            </button>
            {editId && <button onClick={() => {setEditId(null); settitle(''); setcontent('');}} style={{marginLeft: '10px'}}>Cancel</button>}
          </div>
        </div>
      </>
    );
  }
}



export default App;