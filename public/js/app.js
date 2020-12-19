class TimersDashboard extends React.Component{

  componentDidMount(){
    this.loadTimersFromServer();
    setInterval(this.loadTimersFromServer,5000);
  }
  loadTimersFromServer=()=>{
    client.getTimers((serverTimers)=>{
      this.setState({
        timers:serverTimers
      })
    })
  }
  handleCreateFormSubmit=(timer)=>{
    this.createTimer(timer)
  }
  handleEditFormSubmit=(attrs)=>{
    this.updateTimer(attrs);
  }
  handleTrashClick=(id)=>{
    this.deleteTimer(id);
  }
  handleStopClick=(id)=>{
    this.stopTimer(id);
  }
  handleStartClick=(id)=>{
    this.startTimer(id);
  }
  startTimer=(timerId)=>{
    const now= Date.now();
    this.setState({
      timers: this.state.timers.map(timer=>{
        if(timer.id===timerId){
          return(
            Object.assign({},timer,{
              runningSince:now
            })
          )
        } else return timer;
      })
    })
    client.startTimer({
      id:timerId, start:now
    });
  }
  stopTimer=(timerId)=>{
    const now= Date.now();
    this.setState({
      timers: this.state.timers.map(timer=>{
        if(timer.id===timerId){
          const elapsedTime= now-timer.runningSince;
          console.log(timer.elapsed+elapsedTime);
          return Object.assign({},timer,{
            elapsed: timer.elapsed +  elapsedTime,
            runningSince:null
          })
        } else return timer;
      })
    })
    client.stopTimer({
      id:timerId, stop:now
    });
  }
  deleteTimer=(timerId)=>{
    this.setState({
      timers: this.state.timers.filter(timer=> timer.id!== timerId)
    })
    client.deleteTimer({
      id:timerId
    })
  }
  createTimer=(timer)=>{
    const t= helpers.newTimer(timer)
    this.setState({timers:this.state.timers.concat(t)})
    client.createTimer({
      title:t.title,
      project:t.project,
      id:t.id
    })

  }
  updateTimer=(attrs)=>{
    this.setState({
      timers: this.state.timers.map(timer=>{
        if(attrs.id===timer.id){
          return Object.assign({},timer,{
            title:attrs.title,
            project:attrs.project
          })
        }else return timer;
      })
    })
  }

  state={
    timers:[]
  }
  render(){
    return(
      <div className='ui three column centered grid'>
        <div className='column'>
          <EditableTimerList
            timers={this.state.timers}
            onFormSubmit={this.handleEditFormSubmit}  
            onTrashClick={this.handleTrashClick}
            onStartClick={this.handleStartClick}
            onStopClick={this.handleStopClick}
          />
          <ToggleableTimerForm
            isOpen={false}
            onFormSubmit={this.handleCreateFormSubmit}
          />
        </div>
      </div>
    )
  }
}

class EditableTimerList extends React.Component{
  render(){
    const timers=this.props.timers.map(timer=>(
      <EditableTimer
        title={timer.title}
        project={timer.project}
        id={timer.id}
        elapsed={timer.elapsed}
        runningSince={timer.runningSince}
        onFormSubmit={this.props.onFormSubmit}
        onTrashClick={this.props.onTrashClick}
        onStartClick={this.props.onStartClick}
        onStopClick={this.props.onStopClick}
      />
    ))
    return(
      <div id='timers'>
        {timers}
      </div>
    );
  }
}

class EditableTimer extends React.Component{
  state={
    editFormOpen:false
  }
  handleEditClick=()=>{
    this.openForm();
  }
  handleSubmit=(timer)=>{
    this.props.onFormSubmit(timer);
    this.closeForm();
  }
  handleFormClose=()=>{
    this.closeForm();
  }
  openForm=()=>{
    this.setState({ editFormOpen:true });
  }
  closeForm=()=>{
    this.setState({ editFormOpen:false });
  }
  render(){
    if(this.state.editFormOpen){
      return(
        <TimerForm
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          onFormSubmit={this.handleSubmit}
          onFormClose={this.handleFormClose}
        />
      )
    } else{
      return(
        <Timer
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          elapsed={this.props.elapsed}
          runningSince={this.props.runningSince}
          onEditClick={this.handleEditClick}
          onTrashClick={this.props.onTrashClick}
          onStartClick={this.props.onStartClick}
          onStopClick={this.props.onStopClick}
        />
      )
    }
  }
}

class TimerForm extends React.Component {
  state={
    title:this.props.title || '',
    project: this.props.project || ''
  }
  handleTitleChange= (e)=>{
    this.setState({title: e.target.value})
  }
  handleProjectChange= (e)=>{
    this.setState({project: e.target.value})
  }
  handleSubmit= ()=>{
    this.props.onFormSubmit({
      id:this.props.id,
      title:this.state.title,
      project:this.state.project
    })
  }
  render(){
    const submitText= this.props.id ? 'Update' : "Create";
    return(
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Title</label>
              <input type='text' onChange={this.handleTitleChange} value={this.state.title}/>
            </div>
            <div className='field'>
              <label>Project</label>
              <input type='text' onChange={this.handleProjectChange} value={this.state.project}/>
            </div>
            <div className='ui two bottom attached buttons'>
              <button onClick={this.handleSubmit} className='ui basic blue button'>
                {submitText}
              </button>
              <button onClick={this.props.onFormClose} className='ui basic red button'>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
class ToggleableTimerForm extends React.Component{
  state={
    isOpen:false
  }
  handleFormOpen=()=>{
    this.setState({ isOpen:true })
  }
  handleFormClose=()=>{
    this.setState({ isOpen:false})
  }
  handleFormSubmit=(timer)=>{
    this.props.onFormSubmit(timer);
    this.setState({ isOpen:false})
  }
  render(){
    if(this.state.isOpen){
      return (
        <TimerForm
        onFormClose={this.handleFormClose}
        onFormSubmit={this.handleFormSubmit}
        />
      )
    } else{
      return(
        <div className='ui basic content center aligned segment'>
          <button className='ui basic button icon' onClick={this.handleFormOpen}>
            <i className='plus icon'/>
          </button>
        </div>
      )
    }
  }
}

class Timer extends React.Component{
  componentDidMount(){
    this.forceUpdateInterval= setInterval(()=> this.forceUpdate(),50)
  }
  componentWillUnmount(){
    clearImmediate(this.forceUpdateInterval);
  }
  handleTrashClick=()=>{
    this.props.onTrashClick(this.props.id);
  }
  handleStartClick=()=>{
    this.props.onStartClick(this.props.id)
  }
  handleStopClick=()=>{
    this.props.onStopClick(this.props.id)
  }
  render(){
    const elapsedString= helpers.renderElapsedString(this.props.elapsed, this.props.runningSince);

    return(
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {this.props.title}
          </div>
          <div className='meta'>
            {this.props.project}
          </div>
          <div className='center aligned description'>
            <h2>
              {elapsedString}
            </h2>
          </div>
          <div className='extra content'>
            <span onClick={this.props.onEditClick} className='right floated edit icon'>
              <i className='edit icon'></i>
            </span>
            <span onClick={this.handleTrashClick} className='right floated trash icon'>
              <i className='trash icon'/>
            </span>
          </div>
        </div>
        <TimerActionButton
          timerIsRunning={!!this.props.runningSince}
          onStartClick={this.handleStartClick}
          onStopClick={this.handleStopClick}
        />
      </div>
    )
  }

}

class TimerActionButton extends React.Component{
  render(){
    if(this.props.timerIsRunning){
      return(
        <div onClick={this.props.onStopClick} className='ui bottom attached blue basic button'>
        Stop
        </div>
      )
    }else{
      return(
        <div onClick={this.props.onStartClick} className='ui bottom attached blue basic button'>
        Start
        </div>
      )
    }
  }
}

ReactDOM.render(
  <TimersDashboard/>,
  document.getElementById('content')
);