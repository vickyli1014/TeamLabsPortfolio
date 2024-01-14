#ifndef PENDULUM_NODE_H_
#define PENDULUM_NODE_H_

#include "gloo/SceneNode.hpp"
#include "./ParticleState.hpp"
#include "./ParticleSystemBase.hpp"
#include "./IntegratorBase.hpp"
#include "./IntegratorType.hpp"
#include "./PendulumSystem.hpp"
#include "IntegratorFactory.hpp"

#include "gloo/shaders/PhongShader.hpp"
#include "gloo/debug/PrimitiveFactory.hpp"
#include "gloo/components/RenderingComponent.hpp"
#include "gloo/components/ShadingComponent.hpp"


namespace GLOO {
class PendulumNode : public SceneNode {
    public:
        PendulumNode(ParticleState ps, IntegratorType ib, float s){
            IntegratorFactory factory;
            state = ps;
            integrator = factory.CreateIntegrator<PendulumSystem, ParticleState>(ib);
            numSteps = s;
            time = 0.f;
            InitializeSystem();
            PlotParticles();
        }

        void Update(double delta_time) override {
            time += delta_time;
            state = integrator->Integrate(system, state, time, numSteps);
            for (int i=0; i<state.positions.size(); i++) {
                auto position = state.positions[i];
                particle_node_ptrs[i]->GetTransform().SetPosition(position);
            }
            system.particle_state = state;
        }

    private:
        void PlotParticles() {
            auto shader_ = std::make_shared<PhongShader>();
            std::shared_ptr<GLOO::VertexObject> sphere_mesh_ = PrimitiveFactory::CreateSphere(0.05f, 25, 25);
            for (glm::vec3 position : state.positions) {
                auto particle_node = make_unique<SceneNode>();
                particle_node->CreateComponent<ShadingComponent>(shader_);
                particle_node->CreateComponent<RenderingComponent>(sphere_mesh_);
                particle_node->GetTransform().SetPosition(position);
                particle_node_ptrs.push_back(particle_node.get());
                AddChild(std::move(particle_node));
            }
        }

        void InitializeSystem() {
            system.AddParticle(state, 1.0);
            for (int i=0; i<state.positions.size()-1; i++) {
                system.AddSpring(i, i+1);
            }
        }

        PendulumSystem system;
        ParticleState state;
        std::unique_ptr<IntegratorBase<PendulumSystem, ParticleState>> integrator;
        float numSteps;
        float time;
        std::vector<SceneNode*> particle_node_ptrs;
        

        
};}


#endif