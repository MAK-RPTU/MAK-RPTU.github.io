# adaptifleet
•
Built a multi-robot system in Isaac Sim with autonomous task assignment, path planning, and docking across a coordinated fleet — direct work on intelligent path planning for mobile platforms.
•
Deployed a Gemini Flash VLM as a real-time safety layer for collision and conflict detection — vision-language grounding over a multi-agent scene.
•
Wired an LLM planner to dispatch robots via natural language — early prototype of language-to-action behaviour for mobile platforms.

# agilex-scout-mini
Developed and tested low cost fusion pipeline with < 5cm position error under degraded RTK quality using GNSS/IMU, ROS2, Docker

# dfki
•
Set up a digital twin of 6 production sub-modules with a UR5e manipulator in ROS 2 and ran hardware-in-the-loop validation covering mechanical, gripper-action, and safety-sensor states.
•
Built a runtime-reconfigurable URDF parser in ROS 2 — robot adapts automatically to module repositioning.
•
Developed C++ / Python ROS 2 components (action server, Lifecycle node) for Robotiq gripper control with explicit state machines for activation, fault, and recovery cases.

# hcr
•	Designed a collaborative manipulator and applied FEA for validation — 1.5 kg payload, 0.12 mm repeatability.
•	Developed encoder-redundancy safety logic monitoring position, signal presence, and range violations in ST.
•	Improved DFA on assemblies by minimizing part count and reorientation; produced 2D CAD drawings in SolidWorks with full GD&T.
•	Designed and implemented a cost-effective brake mechanism for high-torque sensory actuator units.
•	Replaced manual work in a denim-bleaching zone with a manipulator, eliminating ~95% of respiratory-disorder risk to workers and increasing production.


# john-deere
•
Commissioning a full autonomous stack on a John Deere tractor with whole-vehicle motion control and environmental perception in real outdoor field conditions.
•
Built a GPS/IMU sensor-fusion pipeline reaching < 3 cm position error under fixed RTK and ~12 cm under degraded RTK — characterized failure modes across the signal-quality envelope.
•
Deployed a ROS 2 Docker stack with continuous telemetry and off-site diagnostics for resilient headless operation.

# lifecyclenode
•	Developed a C++ and Python ROS 2 action server and Lifecycle node (ROS 2 state machine) for Robotiq gripper control on a UR5e.

# masterarbeit
•
Built high-fidelity simulation pipelines using USD (Universal Scene Description) and Isaac CORE APIs inside NVIDIA Omniverse Isaac Sim.
•
Used Replicator APIs for randomized lighting, materials, and pose variations — annotated synthetic data at ~0.01 s/frame.
•
Trained a PyTorch pose-estimation model entirely on synthetic data; reached 81 % accuracy on real-camera bin picking without real-data fine-tuning.
•
Authored an Omniverse extension to standardize annotated-dataset generation across ML model formats.

# mit
•
Generated building-scale point-cloud data using simulated LiDAR in NVIDIA Isaac Sim — replicating real-world sensing conditions for downstream segmentation.
•
Performed room- and floor-level semantic segmentation of point clouds for spatial understanding; validated results in ROS / RViz.
•
Automated odometry and point-cloud dataset generation through a single-command pipeline for reproducible experimentation.

# motion
•Deployed the Kimodo locomotion policy and cap-x on a physical Unitree G1 humanoid — closed the sim-to-real gap iteratively through physics-parameter tuning and on-robot validation under real contact and dynamics.
•Commissioned the G1 end-to-end: hardware assembly, ROS 2 software integration (MuJoCo, IsaacLab), and full system validation; documented every hardware/software interface.
•Built a text-to-3D pipeline using Gaussian splats for rapid simulation-environment prototyping — natural-language-grounded scene generation for humanoid testing.
•
Implemented human–robot safety protocols for reliable close-proximity operation; contributed to a real-time teleoperation dashboard for supervisory control.

# nebraska
•	Taught the fundamentals of NVIDIA Isaac Sim to a professor through structured presentations and hands-on simulation sessions.
•
Implemented object classification and 6D pose estimation (YOLOv8/v11, PoseCNN) for manipulation in cluttered scenes on Tiago and Tiago Pro; built an evaluation pipeline comparing simulated and real-camera inputs.
•
Integrated GPT-3.5 Turbo and LLaMA on a Tiago robot for natural-language manipulation — wrapped third-party model APIs in a structured ROS 2 interface, enabling swappable foundation-model comparison for grasping behaviour.
•
Set up Isaac Sim environments for Tiago and Tiago Pro and built ROS 2 service/client interfaces for object attach/detach across simulated and real pick-and-place.

# objectsorting
•	Built a mobile-robot-assisted priority-based sorting system combining MPC and image processing.
•	Solved an online optimization over object color, real-time distances, and weighting factors between objects and robots.
•	Identified and sorted objects into pre-defined stations based on the optimization result.

# ur10e-digitaltwin-spotwelding
Developed a interface to synchronzie the real UR10e robot with isaacsim and ROS2 ecosystem using action graphs and moveit and tested a spot welding trajectory.

# vials
Desgined high fidelity realistic vials with defects such as glass particles, sand particles to generate synthetic data in order to train models robustly to better predict defects during quality control process.

