import React from 'react';

const FALLBACK = username =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'User')}&background=5cb85c&color=fff&size=128`;

// Stryker disable next-line BlockStatement
const handleError = (e, username) => {
  e.target.onerror = null;
  e.target.src = FALLBACK(username);
};

const UserImage = ({ src, username, className, alt }) => (
  <img
    src={src || FALLBACK(username)}
    className={className}
    alt={alt || username}
    // Stryker disable next-line ArrowFunction
    onError={e => handleError(e, username)}
  />
);

export default UserImage;
