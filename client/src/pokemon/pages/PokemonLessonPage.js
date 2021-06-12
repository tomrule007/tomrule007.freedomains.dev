import React, { useEffect, useState } from 'react';

import Stars from '../components/Stars';
import { sendQuery } from '../utilities';

const getUserInfo = () =>
  sendQuery(`{
    user {name, image, lessons {title}, ratings {title, rating} },
    lessons {title}
  }`);

const toRatingsMap = (ratings) =>
  Object.fromEntries(ratings.map(({ title, rating }) => [title, rating]));

const PokemonLoggedInPage = () => {
  const [{ user, lessons }, setUserInfo] = useState({});
  const [ratingsMap, setRatingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getUserInfo().then((results) => {
      setUserInfo(results);
      setRatingsMap(toRatingsMap(results.user.ratings));
      setLoading(false);
    });
  }, []);

  const unenrolledLessons =
    !loading &&
    lessons.filter(
      (lesson) => !user.lessons.some(({ title }) => title === lesson.title)
    );

  const handleEnroll = (title) => {
    sendQuery(`mutation {enroll(title: "${title}") {name}}`)
      .then(getUserInfo)
      .then(setUserInfo);
  };

  const handleUnenroll = (title) => {
    sendQuery(`mutation {unenroll(title: "${title}") {name}}`)
      .then(getUserInfo)
      .then(setUserInfo);
  };

  const handleRateLesson = ({ title, rating }) => {
    sendQuery(
      `mutation { rateLesson(title: "${title}", rating: ${rating}) {ratings {title rating}}}`
    )
      .then((results) => toRatingsMap(results.rateLesson.ratings))
      .then(setRatingsMap);
  };

  return (
    !loading && (
      <div>
        <h1>{user.name}</h1>
        <img src={user.image} />

        <hr />
        {!user.lessons.length ? null : (
          <div className="enrolledSection">
            <h2>Enrolled</h2>
            <p>Click to unenroll</p>
            {user.lessons.map(({ title }, i) => (
              <>
                <h4 key={i} onClick={() => handleUnenroll(title)}>
                  {title}
                </h4>
                <Stars
                  initialGiven={ratingsMap[title] || 0}
                  onSetGiven={(rating) => handleRateLesson({ title, rating })}
                />
              </>
            ))}
          </div>
        )}
        <hr />
        {!unenrolledLessons.length ? null : (
          <div className="notEnrolledSection">
            <h2>Not Enrolled</h2>
            <p>Click to enroll</p>
            {unenrolledLessons.map(({ title }, i) => (
              <h4 key={i} onClick={() => handleEnroll(title)}>
                {title}
              </h4>
            ))}
          </div>
        )}
      </div>
    )
  );
};

export default PokemonLoggedInPage;
