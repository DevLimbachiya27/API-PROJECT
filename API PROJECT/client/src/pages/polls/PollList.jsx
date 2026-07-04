import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPolls, createPoll, castVote } from '../../redux/slices/pollSlice';
import { FiPlus, FiX, FiBarChart2, FiCheckCircle } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const PollList = () => {
  const dispatch = useDispatch();
  const { polls, loading } = useSelector((state) => state.polls);
  const { user } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pollForm, setPollForm] = useState({
    question: '', description: '', options: ['', ''], expiryDate: '', category: 'general'
  });

  useEffect(() => {
    dispatch(fetchPolls({}));
  }, [dispatch]);

  const handleVote = async (pollId, optionIndex) => {
    try {
      await dispatch(castVote({ id: pollId, optionIndex })).unwrap();
      toast.success('Vote recorded!');
    } catch (err) {
      toast.error(err || 'Failed to vote');
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const validOptions = pollForm.options.filter(o => o.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('At least 2 options are required');
      return;
    }

    try {
      await dispatch(createPoll({
        ...pollForm,
        options: validOptions
      })).unwrap();
      toast.success('Poll created!');
      setShowCreateModal(false);
      setPollForm({ question: '', description: '', options: ['', ''], expiryDate: '', category: 'general' });
    } catch (err) {
      toast.error(err || 'Failed to create poll');
    }
  };

  const addOption = () => {
    if (pollForm.options.length < 6) {
      setPollForm({ ...pollForm, options: [...pollForm.options, ''] });
    }
  };

  const updateOption = (index, value) => {
    const updated = [...pollForm.options];
    updated[index] = value;
    setPollForm({ ...pollForm, options: updated });
  };

  const getVotePercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const isPollActive = (poll) => {
    return poll.isActive && new Date(poll.expiryDate) > new Date();
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container" id="polls-page">
      <div className="page-header">
        <div>
          <h1>Polls & Voting</h1>
          <p className="page-subtitle">Participate in community decisions</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} id="create-poll-btn">
            <FiPlus /> Create Poll
          </button>
        )}
      </div>

      {/* Poll Cards */}
      {polls.length > 0 ? (
        <div className="poll-grid">
          {polls.map((poll) => (
            <div key={poll._id} className={`poll-card ${!isPollActive(poll) ? 'poll-ended' : ''}`}>
              <div className="poll-header">
                <h3>{poll.question}</h3>
                {!isPollActive(poll) && <span className="poll-ended-badge">Ended</span>}
              </div>

              {poll.description && <p className="poll-description">{poll.description}</p>}

              <div className="poll-options">
                {poll.options.map((option, idx) => {
                  const percentage = getVotePercentage(option.votes, poll.totalVotes || 0);
                  const isVoted = poll.hasVoted;

                  return (
                    <div key={idx} className="poll-option">
                      {!isVoted && isPollActive(poll) && user?.role === 'resident' ? (
                        <button
                          className="poll-option-btn"
                          onClick={() => handleVote(poll._id, idx)}
                        >
                          {option.text}
                        </button>
                      ) : (
                        <div className="poll-result">
                          <div className="poll-result-bar">
                            <div
                              className="poll-result-fill"
                              style={{ width: `${percentage}%` }}
                            ></div>
                            <span className="poll-option-text">{option.text}</span>
                            <span className="poll-option-percent">{percentage}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="poll-footer">
                <span className="poll-votes">
                  <FiBarChart2 /> {poll.totalVotes || 0} votes
                </span>
                {poll.hasVoted && (
                  <span className="voted-badge"><FiCheckCircle /> You voted</span>
                )}
                <span className="poll-expiry">
                  Ends: {new Date(poll.expiryDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-box">
          <h3>No Polls</h3>
          <p>No polls available at the moment.</p>
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create a Poll</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreatePoll}>
              <div className="form-group">
                <label>Question *</label>
                <input type="text" className="form-input" placeholder="What would you like to ask?"
                  value={pollForm.question} onChange={(e) => setPollForm({...pollForm, question: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-textarea" rows="2" placeholder="Additional context (optional)"
                  value={pollForm.description} onChange={(e) => setPollForm({...pollForm, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Options *</label>
                {pollForm.options.map((opt, idx) => (
                  <input key={idx} type="text" className="form-input option-input"
                    placeholder={`Option ${idx + 1}`} value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)} required />
                ))}
                {pollForm.options.length < 6 && (
                  <button type="button" className="btn btn-sm btn-secondary" onClick={addOption}>
                    <FiPlus /> Add Option
                  </button>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-select" value={pollForm.category}
                    onChange={(e) => setPollForm({...pollForm, category: e.target.value})}>
                    <option value="general">General</option>
                    <option value="event-planning">Event Planning</option>
                    <option value="budget">Budget</option>
                    <option value="vendor">Vendor Selection</option>
                    <option value="community">Community</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input type="date" className="form-input" value={pollForm.expiryDate}
                    onChange={(e) => setPollForm({...pollForm, expiryDate: e.target.value})} required
                    min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Create Poll</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollList;
