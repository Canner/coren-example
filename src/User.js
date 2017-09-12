import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {fetchUser} from './actions';
import {ssr, headParams, routeParams, reactRouterRedux, preloadedState} from 'coren';
import immutable from 'immutable';
import reducer from './reducer';

@reactRouterRedux({reducer})
@routeParams((props, context) => {
  const {db} = context;
  return {
    url: '/users/:id',
    dataProvider: () => db.users.find().execAsync()
  };
})
@headParams(config => {
  const {route} = config;
  const userId = route.data.id;
  return {
    title: `user ${userId}`,
    description: `user ${userId}`
  };
})
@preloadedState((props, options) => {
  const {route} = options;
  const user = route.data;
  return Promise.resolve({
    currentUser: {
      data: user,
      fetched: true,
      isFetching: false,
      error: false
    }
  });
})
@ssr
@connect(mapStateToProps, mapDispatchToProps)
export default class UserList extends Component {
  static propTypes = {
    fetchUser: PropTypes.func,
    userId: PropTypes.string,
    user: PropTypes.object
  };

  static defaultProps = {
    user: new immutable.Map()
  };

  componentDidMount() {
    const {fetchUser, userId} = this.props;
    fetchUser(userId);
  }

  render() {
    const {user} = this.props;
    if (user.fetched && user.error) {
      return <div>Error</div>;
    }

    if (user.isFetching) {
      return <div>loading</div>;
    }

    return (
        <div>
          {user.data.name}
        </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    userId: ownProps.match.params.id,
    user: state.currentUser
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchUser: userId => dispatch(fetchUser(userId))
  };
}
