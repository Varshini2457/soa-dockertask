
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8083/bikerental';

function App() {
  const emptyForm = {
    bikeModel: '',
    rentalDate: '',
    hourlyRate: '',
    available: true,
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
      return 'Cannot connect to the backend. Check that Spring Boot is running on port 8083 and verify CORS configuration.';
    }

    const status = error.response.status;

    if (status === 400) {
      return (
        error.response.data?.message ||
        'Invalid bike details. Please check the entered values.'
      );
    }

    if (status === 404) {
      return 'The requested bike or API endpoint was not found.';
    }

    if (status === 401 || status === 403) {
      return 'You are not authorized to perform this action.';
    }

    if (status >= 500) {
      return 'A server or database error occurred. Check the Spring Boot console.';
    }

    return `Unable to ${action}. Server returned status ${status}.`;
  }

  async function fetchBikes(showErrors = true) {
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/DisplayAll`);

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

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function validateForm() {
    const model = form.bikeModel.trim();
    const rateText = String(form.hourlyRate).trim();
    const rate = Number(rateText);

    if (!model) {
      showMessage('Bike model is required.', 'danger');
      return false;
    }

    if (model.length > 100) {
      showMessage('Bike model must not exceed 100 characters.', 'danger');
      return false;
    }

    if (!form.rentalDate) {
      showMessage('Rental date is required.', 'danger');
      return false;
    }

    if (!rateText || !Number.isFinite(rate) || rate <= 0) {
      showMessage('Hourly rate must be greater than zero.', 'danger');
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (saving || !validateForm()) {
      return;
    }

    // These field names match the JSON response.
    // Confirm that BikeRentalRequest.java uses the same names.
    const bike = {
      bikeModel: form.bikeModel.trim(),
      rentalDate: form.rentalDate,
      hourlyRate: Number(form.hourlyRate),
      available: form.available,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await axios.put(
          `${API_URL}/Update/${editingId}`,
          bike
        );

        showMessage('Bike record updated successfully.');
      } else {
        await axios.post(`${API_URL}/Add`, bike);

        showMessage('Bike record added successfully.');
      }

      setForm({ ...emptyForm });
      setEditingId(null);

      const refreshed = await fetchBikes(false);

      if (!refreshed) {
        showMessage(
          'Bike saved successfully, but records could not be refreshed. Click Refresh Records.',
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
      bikeModel: bike.bikeModel ?? '',
      rentalDate: bike.rentalDate ?? '',
      hourlyRate: String(bike.hourlyRate ?? ''),
      available: bike.available ?? false,
    });

    showMessage(`Editing bike ID ${bike.id}.`, 'info');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
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
      await axios.delete(`${API_URL}/Delete/${id}`);

      setBikes((current) =>
        current.filter((bike) => bike.id !== id)
      );

      if (editingId === id) {
        setEditingId(null);
        setForm({ ...emptyForm });
      }

      showMessage(`Bike ${id} deleted successfully.`);
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
        `${API_URL}/DisplayById/${id}`
      );

      if (!response.data || response.data.id == null) {
        setBikes([]);
        showMessage(`No bike found with ID ${id}.`, 'warning');
      } else {
        setBikes([response.data]);
        showMessage(`Bike ${id} found successfully.`, 'success');
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

  async function showAllBikes() {
    setSearchId('');
    await fetchBikes();
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Navigation */}
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
        {/* Page heading */}
        <div className="text-center mb-4">
          <h1 className="fw-bold text-success">
            Bike Management System
          </h1>

          <p className="text-secondary">
            Add, view, update, and manage your bike maintenance records.
          </p>
        </div>

        {/* Notifications */}
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

        {/* Add / Update form */}
        <section
          className="card shadow-sm border-0 mb-4"
          id="form"
        >
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
                {/* Bike model */}
                <div className="col-md-6">
                  <label
                    className="form-label"
                    htmlFor="bikeModel"
                  >
                    Bike Model *
                  </label>

                  <input
                    className="form-control"
                    type="text"
                    id="bikeModel"
                    name="bikeModel"
                    value={form.bikeModel}
                    onChange={handleChange}
                    placeholder="e.g. Pulsar, Royal Enfield"
                    maxLength={100}
                    required
                  />

                  <small className="text-secondary">
                    Enter the bike model name.
                  </small>
                </div>

                {/* Rental date */}
                <div className="col-md-6">
                  <label
                    className="form-label"
                    htmlFor="rentalDate"
                  >
                    Rental Date *
                  </label>

                  <input
                    className="form-control"
                    type="date"
                    id="rentalDate"
                    name="rentalDate"
                    value={form.rentalDate}
                    onChange={handleChange}
                    required
                  />

                  <small className="text-secondary">
                    Select the rental date.
                  </small>
                </div>

                {/* Hourly rate */}
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
                    placeholder="Enter hourly rate"
                    required
                  />

                  <small className="text-secondary">
                    Rate must be greater than zero.
                  </small>
                </div>

                {/* Availability */}
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

                    <label
                      className="form-check-label"
                      htmlFor="available"
                    >
                      Available for Rent
                    </label>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
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

        {/* Bike records */}
        <section
          className="card shadow-sm border-0"
          id="records"
        >
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

            {/* Search by ID */}
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
                onClick={showAllBikes}
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
                  <span className="visually-hidden">
                    Loading...
                  </span>
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
                      <th>Bike Model</th>
                      <th>Rental Date</th>
                      <th>Hourly Rate</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bikes.map((bike) => (
                      <tr key={bike.id}>
                        <td>{bike.id}</td>

                        <td className="fw-semibold">
                          {bike.bikeModel}
                        </td>

                        <td>{bike.rentalDate}</td>

                        <td>
                          {Number(bike.hourlyRate).toLocaleString(
                            'en-IN'
                          )}
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              bike.available
                                ? 'text-bg-success'
                                : 'text-bg-secondary'
                            }`}
                          >
                            {bike.available
                              ? 'Available'
                              : 'Unavailable'}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              type="button"
                              onClick={() => handleEdit(bike)}
                              disabled={deletingId !== null || saving}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              type="button"
                              onClick={() => handleDelete(bike.id)}
                              disabled={
                                deletingId !== null || saving
                              }
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
