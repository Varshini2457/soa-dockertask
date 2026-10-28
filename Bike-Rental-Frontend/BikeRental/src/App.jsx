import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8083/bikerental';

function App() {
  const emptyForm = {
    bikeName: '',
    hourlyRate: '',
    bikeType: '',
    available: true
  };

  const [bikes, setBikes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchBikes();
  }, []);

  function showMessage(text, type = 'success') {
    setMessage(text);
    setMessageType(type);
  }

  function getApiErrorMessage(error, action = 'complete this request') {
    if (!error.response) {
      return 'Cannot connect to the backend. Make sure Spring Boot is running on port 8083 and check your CORS configuration.';
    }

    const status = error.response.status;

    if (status === 400) {
      return 'The server rejected the submitted data. Check the field values and try again.';
    }

    if (status === 401 || status === 403) {
      return 'You are not authorized to perform this action.';
    }

    if (status === 404) {
      return 'The requested bike or API endpoint was not found.';
    }

    if (status >= 500) {
      return 'A server or database error occurred. Check the Spring Boot Console.';
    }

    return `Unable to ${action}. Server returned status ${status}. Please try again.`;
  }

  async function fetchBikes(showErrors = true) {
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/displayall`);
      setBikes(Array.isArray(response.data) ? response.data : []);
      return true;
    } catch (error) {
      if (showErrors) {
        showMessage(
          getApiErrorMessage(error, 'load bike records'),
          'danger'
        );
      }
      return false;
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  }

  function validateForm() {
    const name = form.bikeName.trim();
    const areaText = String(form.hourlyRate).trim();
    const typeText = String(form.bikeType).trim();
    const area = Number(areaText);

    if (!name) {
      showMessage(
        'Bike name is required. Please enter a name.',
        'danger'
      );
      return false;
    }

    if (name.length > 100) {
      showMessage(
        'Bike name must not exceed 100 characters.',
        'danger'
      );
      return false;
    }

    if (!areaText || !Number.isFinite(area) || area <= 0) {
      showMessage(
        'Hourly rate must be a valid number greater than 0.',
        'danger'
      );
      return false;
    }

    if (!typeText) {
      showMessage('Bike type is required. Please enter a bike type.', 'danger');
      return false;
    }

    if (typeText.length > 80) {
      showMessage('Bike type must not exceed 80 characters.', 'danger');
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (saving || !validateForm()) return;

    const bike = {
      bikeName: form.bikeName.trim(),
      hourlyRate: Number(form.hourlyRate),
      bikeType: form.bikeType.trim(),
      available: form.available
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await axios.put(
          `${API_URL}/updateBikeDetails/${editingId}`,
          bike
        );
        showMessage('Bike updated successfully.');
      } else {
        await axios.post(`${API_URL}/add`, bike);
        showMessage('Bike added successfully.');
      }

      setForm({ ...emptyForm });
      setEditingId(null);

      const refreshed = await fetchBikes(false);

      if (!refreshed) {
        showMessage(
          'Bike saved successfully, but the records could not be refreshed. Click Refresh Records.',
          'warning'
        );
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          getApiErrorMessage(error, 'save bike details'),
        'danger'
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(bike) {
    setEditingId(bike.id);

    setForm({
      bikeName: bike.bikeName ?? '',
      hourlyRate: String(bike.hourlyRate ?? ''),
      bikeType: String(bike.bikeType ?? ''),
      available: bike.available ?? false
    });

    showMessage(`Editing bike ID ${bike.id}.`, 'info');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...emptyForm });
    showMessage('Edit cancelled.', 'info');
  }

  async function handleDelete(id) {
    if (!window.confirm(`Are you sure you want to delete bike ${id}?`)) {
      return;
    }

    setDeletingId(id);

    try {
      await axios.delete(`${API_URL}/delete/${id}`);

      setBikes((current) =>
        current.filter((bike) => bike.id !== id)
      );

      showMessage(`Bike ${id} was deleted successfully.`);
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          getApiErrorMessage(error, 'delete bike'),
        'danger'
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();

    const idText = searchId.trim();
    const id = Number(idText);

    if (!idText || !Number.isInteger(id) || id <= 0) {
      showMessage('Enter a valid positive bike ID.', 'danger');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/displayById/${id}`
      );

      if (!response.data || response.data.id == null) {
        setBikes([]);
        showMessage(`No bike found with ID ${id}.`, 'warning');
      } else {
        setBikes([response.data]);
        showMessage(`Bike ${id} found successfully.`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setBikes([]);
        showMessage(`No bike found with ID ${id}.`, 'warning');
      } else {
        showMessage(
          getApiErrorMessage(error, 'search for the bike'),
          'danger'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-dark bg-success shadow">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#home">
            🌿 Bike Maintenance
          </a>
          <div className="d-flex gap-3">
            <a className="nav-link text-white" href="#form">
              Add Bike
            </a>
            <a className="nav-link text-white" href="#records">
              Bike Records
            </a>
          </div>
        </div>
      </nav>

      <main className="container py-4" id="home">
        <div className="text-center mb-4">
          <h1 className="fw-bold text-success">
            Bike Management System
          </h1>
          <p className="text-secondary">
            Add, view, update, and manage your bike maintenance records.
          </p>
        </div>

        {message && (
          <div
            className={`alert alert-${messageType} alert-dismissible fade show`}
            role="alert"
          >
            {message}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setMessage('')}
            />
          </div>
        )}

        <section className="card shadow-sm border-0 mb-4" id="form">
          <div className="card-header bg-success text-white py-3">
            <h5 className="mb-0">
              {editingId !== null
                ? '✏️ Update Bike'
                : '➕ Add New Bike'}
            </h5>
          </div>

          <div className="card-body p-4">
            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="bikeName">
                    Bike Name *
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="bikeName"
                    name="bikeName"
                    value={form.bikeName}
                    onChange={handleChange}
                    placeholder="Enter bike name"
                    maxLength={100}
                    required
                    aria-describedby="bikeNameHelp"
                  />
                  <small id="bikeNameHelp" className="text-secondary">
                    Maximum 100 characters.
                  </small>
                </div>

                <div className="col-md-6">
                  <label
                    className="form-label"
                    htmlFor="hourlyRate"
                  >
                    Hourly Rate *
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    id="hourlyRate"
                    name="hourlyRate"
                    value={form.hourlyRate}
                    onChange={handleChange}
                    min="0.01"
                    step="any"
                    placeholder="Enter hourly rental rate"
                    required
                  />
                  <small className="text-secondary">
                    Must be greater than zero per hour.
                  </small>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="bikeType">
                    Bike Type *
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    id="bikeType"
                    name="bikeType"
                    value={form.bikeType}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    placeholder="e.g. Mountain, Road, Electric"
                    required
                  />
                  <small className="text-secondary">
                    Enter the type or category of bike.
                  </small>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <div className="form-check form-switch mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="available"
                      name="available"
                      checked={form.available}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="available">
                      Available for Rent
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-4 d-flex flex-wrap gap-2">
                <button
                  className="btn btn-success px-4"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingId !== null
                    ? 'Update Bike'
                    : 'Add Bike'}
                </button>

                {editingId !== null && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}

                <button
                  className="btn btn-outline-success"
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setForm({ ...emptyForm });
                    setEditingId(null);
                    setMessage('');
                  }}
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="card shadow-sm border-0" id="records">
          <div className="card-header bg-white py-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <h5 className="mb-0">📋 Bike Records</h5>

              <button
                className="btn btn-outline-success btn-sm"
                type="button"
                onClick={() => fetchBikes()}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh Records'}
              </button>
            </div>

            <form
              onSubmit={handleSearch}
              className="d-flex flex-wrap gap-2 mt-3"
            >
              <input
                type="number"
                min="1"
                step="1"
                className="form-control"
                style={{ maxWidth: '260px' }}
                placeholder="Search by bike ID"
                aria-label="Search by bike ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />

              <button
                className="btn btn-success"
                type="submit"
                disabled={loading}
              >
                Search
              </button>

              <button
                className="btn btn-outline-secondary"
                type="button"
                disabled={loading}
                onClick={() => {
                  setSearchId('');
                  fetchBikes();
                }}
              >
                Show All
              </button>
            </form>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center p-5">
                <div
                  className="spinner-border text-success"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 mb-0">
                  Loading bike records...
                </p>
              </div>
            ) : bikes.length === 0 ? (
              <div className="text-center text-secondary p-5">
                <h6>No bike records found</h6>
                <p className="mb-0">
                  Try another ID, add a bike, or refresh the records.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-success">
                    <tr>
                      <th>ID</th>
                      <th>Bike Name</th>
                      <th>Hourly Rate</th>
                      <th>Bike Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bikes.map((bike) => (
                      <tr key={bike.id}>
                        <td>{bike.id}</td>
                        <td className="fw-semibold">
                          {bike.bikeName}
                        </td>
                        <td>{bike.hourlyRate}</td>
                        <td>{bike.bikeType}</td>
                        <td>
                          <span
                            className={`badge ${
                              bike.available
                                ? 'text-bg-success'
                                : 'text-bg-secondary'
                            }`}
                          >
                            {bike.available ? 'Active' : 'Unavailable'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              type="button"
                              onClick={() => handleEdit(bike)}
                              disabled={deletingId !== null}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              type="button"
                              onClick={() => handleDelete(bike.id)}
                              disabled={deletingId !== null}
                            >
                              {deletingId === bike.id
                                ? 'Deleting...'
                                : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card-footer bg-white text-secondary small">
            Records displayed: {bikes.length}
          </div>
        </section>

        <footer className="text-center text-secondary py-4">
          Bike Maintenance Management System
        </footer>
      </main>
    </div>
  );
}

export default App;