import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/alltasks.css";
import SkeletonUserCard from "../users/SkeletonUserCard";
import Pagination from "./Pagination";

const TaskCard = ({ task, onDelete }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDelete = () => {
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    onDelete(task._id);
    setShowConfirmation(false);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="task-title">
          <h5 className="card-title">
            <strong>Title:</strong> {task.title}
          </h5>
        </div>
        <div className="task-description">
          <p className="card-text">
            <strong>Description:</strong> {task.description}
          </p>
        </div>
      </div>
      <div className="card-footer d-flex justify-content-between rounded-bottom">
        {showConfirmation ? (
          <div
            className="popup bg-white rounded p-3 d-flex flex-column align-items-center justify-content-center"
            style={{ width: "600px", minHeight: "200px" }}
          >
            <p className="confirmation-text" style={{ fontSize: "24px" }}>
              Are you sure you want to delete?
            </p>
            <div className="btn-group d-flex align-items-center">
              <button
                className="btn1 btn-danger btn-rounded"
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button
                className="btn1 btn-secondary btn-rounded ml-2"
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="btn-group">
            <Link
              className="btn btn-primary btn-rounded"
              to={`/tasks/${task._id}`}
            >
              View
            </Link>
            <Link
              className="btn btn-outline-primary btn-rounded"
              to={`/tasks/edit/${task._id}`}
            >
              Edit
            </Link>
            <button
              className="btn btn-danger btn-rounded ml-2"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
        {showConfirmation && <div className="popup-shadow"></div>}
      </div>
    </div>
  );
};

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadTasks();
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm) {
      setSearchResults(
        tasks.filter(
          (task) =>
            task.title &&
            task.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, tasks]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = searchTerm
    ? searchResults.slice(indexOfFirstItem, indexOfLastItem)
    : tasks.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
  };

  return (
    <div className="container">
      <div className={`py-4`}>
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="text-center">All Tasks</h1>
          <div className="search-bar">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
            />
            {searchTerm && (
              <button className="clear-btn" onClick={handleSearchClear}>
                Clear
              </button>
            )}
          </div>
          <Link to="/task/add" className="btn btn1 btn-primary btn-rounded">
            Add a task
          </Link>
        </div>
        <div className="row mt-4">
          {loading ? (
            Array.from({ length: itemsPerPage }).map((_, index) => (
              <div className="col-md-6 col-lg-4 mb-4" key={index}>
                <SkeletonUserCard />
              </div>
            ))
          ) : currentTasks.length === 0 ? (
            <div className="col-md-12 text-center">
              {searchTerm ? <h3>No tasks found</h3> : null}
            </div>
          ) : (
            currentTasks.map((task) => (
              <div className="col-md-6 col-lg-4 mb-4" key={task._id}>
                <TaskCard task={task} onDelete={deleteTask} />
              </div>
            ))
          )}
        </div>
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={searchTerm ? searchResults.length : tasks.length}
          currentPage={currentPage}
          paginate={paginate}
        />
      </div>
    </div>
  );
};

export default AllTasks;
