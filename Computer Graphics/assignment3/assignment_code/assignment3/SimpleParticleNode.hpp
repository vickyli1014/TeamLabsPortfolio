#ifndef SIMPLE_PARTICLE_NODE_H_
#define SIMPLE_PARTICLE_NODE_H_

#include "gloo/SceneNode.hpp"
#include "./ParticleState.hpp"
#include "./ParticleSystemBase.hpp"
#include "./IntegratorBase.hpp"
#include "./IntegratorType.hpp"
#include "./SimpleParticleSystem.hpp"
#include "IntegratorFactory.hpp"

namespace GLOO {
class SimpleParticleNode : public SceneNode {
    public:
        SimpleParticleNode(ParticleState ps, IntegratorType ib, float s){
            IntegratorFactory factory;
            state = ps;
            integrator = factory.CreateIntegrator<SimpleParticleSystem, ParticleState>(ib);
            numSteps = s;
            time = 0.f;
        }
        void Update(double delta_time) override {
            time += delta_time;
            state = integrator->Integrate(system, state, time, numSteps);
                auto position = state.positions[0];
                GetTransform().SetPosition(position);
        }

    private:
        SimpleParticleSystem system;
        ParticleState state;
        std::unique_ptr<IntegratorBase<SimpleParticleSystem, ParticleState>> integrator;
        float numSteps;
        float time;
};}


#endif