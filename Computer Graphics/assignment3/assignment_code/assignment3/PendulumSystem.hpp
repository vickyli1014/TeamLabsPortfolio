#ifndef PENDULUM_SYSTEM_H_
#define PENDULUM_SYSTEM_H_

#include "./ParticleSystemBase.hpp"
#include "./ParticleState.hpp"
#include "glm/gtx/string_cast.hpp"
#include <map>  

namespace GLOO {
class PendulumSystem : public ParticleSystemBase {

public:
    ParticleState ComputeTimeDerivative(const ParticleState& state,
                                              float time) const override {
        const float drag_const = 0.47f;
        ParticleState newState;
        // fixes the first particle
        newState.positions.push_back(glm::vec3(0.f));
        newState.velocities.push_back(glm::vec3(0.f));
        // find the derivatives of all other particles
        for (int i=1; i<state.positions.size(); i++) {
            if (std::find(fixed.begin(), fixed.end(), i) != fixed.end()) {
                newState.positions.push_back(glm::vec3(0.f));
                newState.velocities.push_back(glm::vec3(0.f));
                continue;
            }
            float mass = 1;
            glm::vec3 position = state.positions[i];
            glm::vec3 velocity = state.velocities[i];
            newState.positions.push_back(velocity);

            glm::vec3 gravity(0.f, -9.81f * mass, 0.f);
            glm::vec3 drag = -drag_const * velocity;
            // get spring forces from connected particles
            glm::vec3 spring(0.f);
            for (glm::vec3 particle : connections[i]) {
                auto other_position = particle_state.positions[particle[0]];
                auto k = particle[1];
                auto rest_length = particle[2];
                auto d = position - other_position;
                auto d_mag = glm::length(d);
                spring += -k * (d_mag - rest_length) * (d / d_mag);
            }
            glm::vec3 acceleration = (gravity + drag + spring) / mass;
            newState.velocities.push_back(acceleration);
        }
        return newState;
    }

    void AddParticle(const ParticleState& state, float mass) {
        for (int i=0; i<state.positions.size(); i++){
            particle_state.positions.push_back(state.positions[i]);
            particle_state.velocities.push_back(state.velocities[i]);
            connections.push_back(std::vector<glm::vec3>());
        }
    }

    void AddSpring(int i, int j, float k=20.0f, float rest=0.01f) {
        connections[i].push_back(glm::vec3(j, k, rest));
        connections[j].push_back(glm::vec3(i, k, rest));
    }

    void FixParticle(int index) {
        fixed.push_back(index);
    }

    ParticleState particle_state;
    std::vector<std::vector<glm::vec3>> connections;

private:
    // strings: map from int (ind of particle) of vec3 (index of connected particles, stiffness, rest length)
    std::vector<float> masses;
    std::vector<int> fixed;
};
}


#endif