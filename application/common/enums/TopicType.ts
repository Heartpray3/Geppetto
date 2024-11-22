export enum TopicType {
    start_mission = 'common_msgs/msg/StartMission',
    stop_mission = 'common_msgs/msg/StopMission',
    identify_robot = 'common_msgs/msg/IdentifyRobot',
    mission_status = 'common_msgs/msg/MissionStatus',
    log_message = 'common_msgs/msg/LogMessage',
    map = 'nav_msgs/msg/OccupancyGrid',
    update_code = 'common_msgs/msg/UpdateControllerCode',
}