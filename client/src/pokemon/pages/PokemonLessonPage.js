import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

import Stars from '../components/Stars';

const toRatingsMap = (ratings) =>
  Object.fromEntries(ratings.map(({ title, rating }) => [title, rating]));

const ENROLL = gql`
  mutation Enroll($title: String!) {
    enroll(title: $title) {
      name
      lessons {
        title
      }
    }
  }
`;

const UNENROLL = gql`
  mutation Unenroll($title: String!) {
    unenroll(title: $title) {
      name
      lessons {
        title
      }
    }
  }
`;

const RATE_LESSON = gql`
  mutation RateLesson($title: String!, $rating: Int!) {
    rateLesson(title: $title, rating: $rating) {
      name
      ratings {
        title
        rating
      }
    }
  }
`;

const GET_USER_INFO = gql`
  query {
    user {
      name
      image
      lessons {
        title
      }
      ratings {
        title
        rating
      }
    }
    lessons {
      title
    }
  }
`;

const PokemonLoggedInPage = () => {
  const {
    loading: loading,
    error,
    data: { user, lessons } = {},
  } = useQuery(GET_USER_INFO);

  //# TODO: remove refetch! switch to using returned mutation! { data }
  const [enroll] = useMutation(ENROLL);
  const [unenroll] = useMutation(UNENROLL);
  const [rateLesson] = useMutation(RATE_LESSON);

  const [unenrolledLessons, setUnenrolledLessons] = useState([]);
  const [ratingsMap, setRatingsMap] = useState({});

  useEffect(() => {
    if (loading) return;

    setUnenrolledLessons(
      lessons.filter(
        (lesson) => !user.lessons.some(({ title }) => title === lesson.title)
      )
    );
    setRatingsMap(toRatingsMap(user.ratings));
  }, [loading, user]);

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
              <React.Fragment key={String(title).concat(ratingsMap[title])}>
                <h4 onClick={() => unenroll({ variables: { title } })}>
                  {title}
                </h4>
                <Stars
                  initialGiven={ratingsMap[title] || 0}
                  onSetGiven={(rating) =>
                    rateLesson({ variables: { title, rating } })
                  }
                />
              </React.Fragment>
            ))}
          </div>
        )}
        <hr />
        {!unenrolledLessons.length ? null : (
          <div className="notEnrolledSection">
            <h2>Not Enrolled</h2>
            <p>Click to enroll</p>
            {unenrolledLessons.map(({ title }, i) => (
              <h4 key={i} onClick={() => enroll({ variables: { title } })}>
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
