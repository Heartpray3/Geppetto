from ..core.entity import Entity
from ..core.pose import Pose
from ..core.size import Size
from launch_ros.actions import Node


class Robot(Entity):
    _id = 0
    robot_state_publishers = []

    def __init__(
        self,
        name="robot",
        model_name="limo_diff_drive_template",
        pose: Pose = None,
        size: Size = Size(x=0.20, y=0.20, z=0.1),
    ) -> None:
        self.name = name
        self.model_name = model_name
        self.build_entity(pose, size)
        self.index = Robot.get_id()
        self.spawn_robot()

    @staticmethod
    def get_id() -> int:
        current_id = Robot._id
        Robot._id += 1
        return current_id

    def load_model_sdf(self) -> str:
        robot_desc = Entity.load_model_sdf(self.model_name)

        # Replace template {index} with the current robot index
        robot_desc = robot_desc.replace("{index}", str(self.index))

        return robot_desc

    def create_robot_state_publisher(self) -> None:
        robot_desc = self.load_model_sdf()

        robot_state_publisher = Node(
            package="robot_state_publisher",
            executable="robot_state_publisher",
            name=f"robot_state_publisher{self.index}",
            output="both",
            parameters=[
                {"use_sim_time": True},
                {"robot_description": robot_desc},
            ],
            remappings=[("/robot_description", f"/robot_description{self.index}")],
        )
        Robot.robot_state_publishers.append(robot_state_publisher)

    def spawn_robot(self) -> Node:
        if Robot.check_spawn_kill(self):
            return

        self.create_robot_state_publisher()

        robot_node = Node(
            package="ros_gz_sim",
            executable="create",
            output="screen",
            arguments=[
                "-topic",
                f"/robot_description{self.index}",
                "-name",
                f"limo_diff_drive{self.index}",
                "-x",
                str(self.pose.x),
                "-y",
                str(self.pose.y),
                "-z",
                str(self.pose.z),
                "-R",
                str(self.pose.roll),
                "-P",
                str(self.pose.pitch),
                "-Y",
                str(self.pose.yaw),
            ],
        )

        Entity.spawned_entities_nodes.append(robot_node)
        return robot_node

    @classmethod
    def check_spawn_kill(cls, robot: "Robot") -> bool:
        return super().check_spawn_kill(robot)