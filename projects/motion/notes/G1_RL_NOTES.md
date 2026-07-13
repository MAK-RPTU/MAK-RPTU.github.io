# Unitree G1 Humanoid Locomotion — RL Portfolio Package

PPO locomotion policies for the Unitree G1 humanoid (29 actuated DoF), trained
entirely in simulation (MuJoCo Playground + MJX + Brax) on a single NVIDIA A4000
GPU. One pipeline, two runs: flat terrain, and rough terrain with domain
randomization enabled by a flag flip.

## Videos (1280×720, tracking camera)

| File | What it shows |
|---|---|
| `g1_flat_untrained.mp4` | Flat terrain, policy at training step 0 (random network) — falls within ~1 s, 8 falls in 10 s |
| `g1_flat_trained_forward.mp4` | Flat terrain, trained policy (200M steps), commanded 1.0 m/s forward |
| `g1_flat_trained_mixed.mp4` | Flat terrain, trained policy, randomly resampled commands (walking, turning, sidestepping) |
| `g1_rough_untrained.mp4` | Rough terrain, untrained policy — 9 falls in 10 s |
| `g1_rough_trained_forward.mp4` | Rough terrain, trained policy (200M steps + domain randomization), 0.5 m/s forward |
| `g1_rough_trained_mixed.mp4` | Rough terrain, trained policy, randomly resampled commands |

All rendered with the model's center-of-mass tracking camera (zoomed out 1.5×),
so the robot stays framed for the full clip.

## Plots — captions for attachment

**`g1_plot_training_reward.png` — PPO training curve.**
Evaluation episode reward vs. environment steps (deterministic eval every 10M
steps; band = ±1 std across eval episodes). Flat terrain climbs from −5.9 to
~17 and plateaus around 160M steps; rough terrain + domain randomization reaches
~7.4. The two curves use identical reward weights — the rough task's lower
plateau reflects a harder task and randomized dynamics, not a worse policy.

**`g1_plot_episode_length.png` — Survival curve.**
Mean evaluation episode length. Episodes terminate early when the torso tilts
past the fall threshold, so this is a direct "does it fall over?" metric: from
~40 steps (<1 s — immediate collapse) to 750–800 steps of the 1000-step cap.

**`g1_plot_reward_terms.png` — Reward decomposition.**
Per-term evaluation breakdown. The commanded-velocity tracking terms (the actual
objective) dominate the learned reward; the fall-termination penalty decays
toward zero as the gait stabilizes. Gait-shaping terms (feet phase) grow with
walking competence. Same weights on both terrains.

## Training configuration (identical for both runs)

PPO (Brax), tuned defaults from `mujoco_playground/config/locomotion_params.py`:

| Parameter | Value | | Parameter | Value |
|---|---|---|---|---|
| Total env steps | 200,000,000 | | Learning rate | 3e-4 |
| Parallel envs | 8192 | | Discount γ | 0.97 |
| Unroll length | 20 | | GAE λ | 0.95 |
| Batch/rollout | 163,840 transitions | | PPO clip ε | 0.2 |
| Minibatches × epochs | 32 × 4 | | Entropy cost | 0.005 |
| Episode length | 1000 steps (20 s) | | Max grad norm | 1.0 |
| Actor net | MLP 512-256-128 | | Obs normalization | yes (running mean/std) |
| Critic net | MLP 512-256-128 | | Evals / checkpoints | every 10M steps (×20) |

Asymmetric actor-critic: the actor sees a 103-d observation (joint pos/vel,
projected gravity, previous action, velocity command, with sensor noise); the
critic sees a 216-d privileged observation (true root velocity, contact states,
push forces) available only in simulation.

### What each parameter does — effect of turning it up or down

None of these values is derived from theory; they are empirically tuned
defaults for this robot family. The transferable knowledge is the *direction*
each knob pushes:

| Parameter (ours) | What it controls | Increase → | Decrease → |
|---|---|---|---|
| Total env steps (200M) | how long we train | better policy, more GPU-hours; we plateau ~160M | undertrained (our 5M smoke test: robot barely stands) |
| Parallel envs (8192) | robots simulated at once | more diverse data per batch, more GPU memory | noisier gradients, GPU underutilized |
| Unroll length (20) | steps collected per env per rollout | longer credit-assignment window | myopic advantage estimates |
| Learning rate (3e-4) | gradient step size | faster early learning, risk of divergence/collapse | slow, may stall on plateaus |
| Discount γ (0.97) | planning horizon (~1/(1−γ) ≈ 33 steps ≈ 0.7 s, one stride) | optimizes further ahead, higher variance, less stable | short-sighted: avoids falling *now* but never learns multi-stride gaits |
| GAE λ (0.95) | trust critic vs. observed rewards | (→1) unbiased but noisy advantages | (→0) low variance but biased by early, wrong critic |
| PPO clip ε (0.2) | max policy change per update ("trust region") | bigger, riskier updates — can un-learn walking in one step | very stable but slow |
| Entropy cost (0.005) | exploration bonus for staying random | more exploration, jittery gait, slower convergence | premature convergence — can lock into a bad shuffle it can't explore out of |
| Minibatches × epochs (32×4) | how hard each rollout is reused | sample-efficient but policy drifts from the data (clipping fights this) | wasteful but very stable |
| Max grad norm (1.0) | clips rare huge gradients | (looser) occasional spikes destabilize the policy | (tighter) slows learning |
| Episode length (1000 = 20 s) | max exposure per episode | practices sustained walking longer | never practices beyond short bursts |
| Network size (512-256-128) | policy/critic capacity | more expressive, slower, overfit risk | too small to represent a good gait |
| action_scale (0.5) | how far one action can move joint targets | bigger, faster motions — but violent early exploration breaks training | timid motions, can't reach commanded speeds |
| tracking σ (0.25) | tolerance of the velocity-tracking reward | more forgiving — reward even when tracking is sloppy | reward only for near-perfect tracking — sparse signal, slower start |
| Push magnitude (0.1–2 m/s) | strength of random shoves during training | more robust to disturbance, harder to learn | policy never learns to catch itself |
| Reward weight: any penalty (e.g. orientation −2.0) | how much that behavior is punished | cleaner behavior on that axis, but can suppress useful motion (over-penalized energy → shuffling) | that behavior degrades (e.g. torso wobbles) |

Environment (both runs): action = 29 joint-target deltas, `action_scale` 0.5,
control at 50 Hz over 500 Hz physics; commands vx ∈ [−1, 1], vy ∈ [−0.5, 0.5],
ωyaw ∈ [−1, 1], resampled mid-episode; random pushes of 0.1–2.0 m/s every
5–10 s; termination on torso tilt.

Reward weights (both runs): tracking_lin_vel 1.0, tracking_ang_vel 0.75
(σ 0.25), feet_air_time 2.0, feet_phase 1.0, orientation −2.0,
dof_pos_limits −1.0, stand_still −1.0, feet_slip −0.25, joint_deviation_hip
−0.25, ang_vel_xy −0.15, collision −0.1, pose −0.1, joint_deviation_knee −0.1,
contact_force −0.01, termination −100.

## What differs between the two runs

| | Flat run | Rough run |
|---|---|---|
| Env name | `G1JoystickFlatTerrain` | `G1JoystickRoughTerrain` |
| Terrain | flat plane | rocky heightfield (20×20 m, ±5 cm relief) |
| Domain randomization | off | on (`--domain_randomization`) |
| Wall time (1× A4000) | 2 h 34 m | 6 h 01 m |
| Final eval reward | ~17 | ~7.4 |

## Domain randomization

**In simple words:** a policy trained in one perfect, unchanging simulator
learns to exploit that exact simulator — like practicing only ever on one
specific pair of shoes, on one specific floor. The real robot will have
slightly different motor strength, mass, and floor grip, and such a policy
falls over the moment reality differs from the sim ("sim-to-real gap"). Domain
randomization fixes this by making every one of the 8192 simulated robots
slightly different — one is a bit heavier, one has slippery feet, one has
stiffer joints — and re-rolling these differences at every reset. The policy
can't memorize any single robot, so it is forced to learn a way of walking
that works for *all of them*. A robot that can walk with any of 8192 slightly
wrong bodies can also walk with the one real body it eventually gets.

**Technically** (per environment, at every reset): floor friction U(0.4, 1.0);
joint friction-loss ×U(0.5, 2.0); armature ×U(1.0, 1.05); all link masses
×U(0.9, 1.1); torso mass ±1.0 kg; default-pose jitter ±0.05 rad. The critic
(which sees privileged state) can still evaluate accurately per-variant, while
the actor must succeed from its noisy sensors alone. Combined with the
asymmetric critic and PD position-target actions, this is the standard
sim-to-real recipe.

**Why DR only on the rough run and not on flat?** Nothing forbids DR on flat
terrain — it's an independent flag and a deployment-grade flat policy *would*
use it. The two runs deliberately play different roles:

- The **flat run is the clean baseline**: nominal physics, no randomization,
  so its learning curve shows what pure PPO does on the easiest version of the
  task, and any difference in the second run is attributable to the added
  difficulty.
- The **rough run is the robustness run**: uneven ground and randomized
  dynamics together, i.e. the full sim-to-real recipe in one training run.
- DR is not free: it makes the task strictly harder, which costs training
  reward and wall time (2.5 h → 6 h here). You pay that cost when the goal is
  a transferable policy, not when the goal is a reference curve.
- Pairing them also makes the portfolio story crisp: same pipeline, same
  hyperparameters, one flag flip — and the policy goes from "walks on a
  perfect floor" to "walks on broken ground with a body it has never had
  before."

## Workflow diagram

`g1_workflow_diagram.png` — the seven-stage pipeline (robot model → MDP
environment → domain randomization → vectorized MJX simulation → PPO → eval/
checkpointing → deployed policy) with the parameters used at each stage.
