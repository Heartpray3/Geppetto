export enum Topic {
    start_mission = '/start_mission_command',
    stop_mission = '/stop_mission_command',
    identify_command1 = '/robot_1/identify_command',
    identify_command2 = '/robot_2/identify_command',
    mission_status1 = '/robot_1/mission_status',
    mission_status2 = '/robot_2/mission_status',
    gazebo_mission_status = '/gazebo/mission_status',
}