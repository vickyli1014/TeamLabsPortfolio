#ifndef SIMPLE_PARTICLE_SYSTEM_H_
#define SIMPLE_PARTICLE_SYSTEM_H_

#include "./ParticleSystemBase.hpp"
#include "./ParticleState.hpp"
#include "glm/gtx/string_cast.hpp"

namespace GLOO {
class SimpleParticleSystem : public ParticleSystemBase {

public:
    ParticleState ComputeTimeDerivative(const ParticleState& state,
                                              float time) const override {
        ParticleState newState;
        if (state.positions.size() == 1) {
            auto oldPosition = state.positions[0];
            auto newPosition = glm::vec3(-oldPosition[1], oldPosition[0], 0);
            newState.positions.push_back(newPosition);
            newState.velocities.push_back(state.velocities[0]);
        }
        return newState;
    }

};
}


#endif