import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  button: {
    margin: theme.spacing(1),
    padding: '10px 40px',
    fontSize: '20px',
    marginTop: '20px'
  },
  rightIcon: {
    marginLeft: theme.spacing(1)
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '100vw'
  }
}));

export default function Contact() {
  const classes = useStyles();
  // const [values, setValues] = React.useState({
  //   name: 'Your Name'
  // });

  return (
    <form className={classes.container} noValidate autoComplete="off">
      <TextField
        id="outlined-name"
        label="Name"
        type="text"
        className={classes.textField}
        // value={values.name}
        margin="normal"
        variant="outlined"
      />
      <TextField
        id="outlined-email-input"
        label="Email"
        className={classes.textField}
        type="email"
        name="email"
        autoComplete="email"
        margin="normal"
        variant="outlined"
      />
      <TextField
        id="outlined-with-placeholder"
        label="Text"
        className={classes.textField}
        margin="normal"
        variant="outlined"
      />
      <Button variant="contained" color="primary" className={classes.button}>
        Send
        <Icon className={classes.rightIcon}>send</Icon>
      </Button>
    </form>
  );
}
