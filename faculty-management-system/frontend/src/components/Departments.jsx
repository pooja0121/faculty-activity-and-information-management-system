import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Departments = ({ token }) => {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const addDepartment = async () => {
    try {
      await axios.post('/api/departments', newDepartment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewDepartment({ name: '', description: '' });
      fetchDepartments();
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  return (
    <div className="departments-container">
      <h2>Departments</h2>
      <div className="add-department">
        <input
          type="text"
          placeholder="Department Name"
          value={newDepartment.name}
          onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newDepartment.description}
          onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
        />
        <button onClick={addDepartment}>Add Department</button>
      </div>
      <ul className="departments-list">
        {departments.map((dept) => (
          <li key={dept._id}>
            <h3>{dept.name}</h3>
            <p>{dept.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Departments;
