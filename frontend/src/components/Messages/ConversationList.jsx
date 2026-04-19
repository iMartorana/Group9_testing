import { useState, useEffect } from "react";
import { getConversationsForUser  } from "../../services/supabaseapi";
/*
Component to get conversations and messages for a user
*/

export default function ConversationList({ dbUser, selectedConversation, onSelect, initialConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        /*
        Fetch conversations that have messages involving this user. Not sure if user_id is
        properly implemented since the hook things are inconsistent.
        Does not have an in app error pop up
        */
        const { data, error } = await getConversationsForUser(dbUser.user_id);
        if (error) throw error;
        setConversations(data || []);

        if (initialConversationId && data) {
          const target = data.find(c => c.conversation_id === Number(initialConversationId));
          if (target) onSelect(target);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    if (dbUser) fetchConversations();
  }, [dbUser]);

  const getOtherParticipant = (c) => {
    const other = c.initiator_user_id === dbUser.user_id ? c.recipient : c.initiator;
    if (!other) return "Unknown";
    return `${other.first_name} ${other.last_name}`;
  };

  const getLastMessage = (c) => {
    const msgs = c.messages ?? [];
    if (!msgs.length) return "No messages yet";
    const last = [...msgs].sort(
      (a, b) => new Date(b.sent_at) - new Date(a.sent_at)
    )[0];
    return last.body.length > 50 ? last.body.slice(0, 50) + "..." : last.body;
  };

  const getLastMessageTime = (c) => {
    const msgs = c.messages ?? [];
    if (!msgs.length) return new Date(c.created_at).toLocaleDateString();
    const last = [...msgs].sort(
      (a, b) => new Date(b.sent_at) - new Date(a.sent_at)
    )[0];
    return new Date(last.sent_at).toLocaleDateString();
  };

  if (loading) return <div className="card p-3">Loading conversations...</div>;

  return (
    <div className="card">
      <div className="card-header fw-bold">Conversations</div>
      {conversations.length === 0 ? (
        <div className="card-body text-muted">No conversations yet.</div>
      ) : (
        <div className="list-group list-group-flush">
          {conversations.map(c => (
            <button
              key={c.conversation_id}
              className={`list-group-item list-group-item-action ${
                selectedConversation?.conversation_id === c.conversation_id ? "active" : ""
              }`}
              onClick={() => onSelect(c)}
            >
              <div className="fw-bold small">{getOtherParticipant(c)}</div>
              <div className="text-muted small text-truncate">{getLastMessage(c)}</div>
              <div className="text-muted" style={{ fontSize: "11px" }}>{getLastMessageTime(c)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}