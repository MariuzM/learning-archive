import React from 'react';
import HeroTitle from '../HeroTitle';
import Typography from '@material-ui/core/Typography';

const Home = () => {
  return (
    <div>
      <HeroTitle />
      <div>
        <Typography variant="h3" align="center">
          Home
        </Typography>
        <Typography>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae repudiandae repellat
          illo magni eligendi cupiditate voluptates eius nam voluptate. Incidunt nihil ullam quae
          quia officia quaerat, deserunt eligendi explicabo totam?
        </Typography>
        <Typography>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae repudiandae repellat
          illo magni eligendi cupiditate voluptates eius nam voluptate. Incidunt nihil ullam quae
          quia officia quaerat, deserunt eligendi explicabo totam?
        </Typography>
      </div>
    </div>
  );
};

export default Home;
