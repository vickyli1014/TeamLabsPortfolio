#ifndef CLOTH_NODE_H_
#define CLOTH_NODE_H_

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
#include "gloo/shaders/SimpleShader.hpp"
#include "gloo/components/MaterialComponent.hpp"

namespace GLOO{
class ClothNode : public SceneNode {
    public:
    ClothNode(IntegratorType ib, float s) {
        IntegratorFactory factory;
        integrator = factory.CreateIntegrator<PendulumSystem, ParticleState>(ib);
        numSteps = s;
        time = 0.f;
        n=15;
        InitializeParticles();
        InitializeStructural();
        InitializeShear();
        InitializeFlex();
        PlotWireFrame();
        UpdateWireFrame();
    }

    void Update(double delta_time) override {
        time += delta_time;
        state = integrator->Integrate(system, state, time, numSteps);
        for (int i=0; i<state.positions.size(); i++) {
            auto position = state.positions[i];
            particle_node_ptrs[i]->GetTransform().SetPosition(position);
        }
        system.particle_state = state;
        UpdateWireFrame();

    }

    private: 
    void Draw() {

    }

    int IndexOf(int i, int j) {
        return i * n + j;
    }

    void InitializeParticles() {
        glm::vec3 origin(0.f);
        float delta = -0.5f;
            // auto shader_ = std::make_shared<PhongShader>();
            // std::shared_ptr<GLOO::VertexObject> sphere_mesh_ = PrimitiveFactory::CreateSphere(0.05f, 25, 25);
        for (int i=0; i<n; i++){
            for (int j=0; j<n; j++) {
                auto particle_node = make_unique<SceneNode>();
                glm::vec3 position(-i*delta, j*delta, 0.f);
                glm::vec3 velocity(0.f);
                // particle_node->CreateComponent<ShadingComponent>(shader_);
                // particle_node->CreateComponent<RenderingComponent>(sphere_mesh_);
                particle_node->GetTransform().SetPosition(position);
                particle_node_ptrs.push_back(particle_node.get());
                AddChild(std::move(particle_node));
                state.positions.push_back(position);
                state.velocities.push_back(velocity);
            }
        }
        system.AddParticle(state, mass/(n*n));
        system.FixParticle(0);
        system.FixParticle(n*n-n);
    }

    void InitializeStructural() {
        float rest_length = 2.0/n;
        float k = n*5;

        for (int i=0; i<n-1; i++) {
            for (int j=0; j<n-1; j++) {
                int current_ind = IndexOf(i, j);
                int right_ind = IndexOf(i, j+1);
                int bot_ind = IndexOf(i+1, j);
                system.AddSpring(current_ind, right_ind, k, rest_length);
                system.AddSpring(current_ind, bot_ind, k, rest_length);
            }
        }

        // for last row, connect horizontal springs
        for (int j=0; j<n-1; j++) {
            int current_ind = IndexOf(n-1, j);
            int right_ind = IndexOf(n-1, j+1);
            system.AddSpring(current_ind, right_ind, k, rest_length);
        }
        // for last column, connect vertical springs
        for (int i=0; i<n-1; i++) {
            int current_ind = IndexOf(i, n-1);
            int bot_ind = IndexOf(i+1, n-1);
            system.AddSpring(current_ind, bot_ind, k, rest_length);
        }

    }

    void PlotWireFrame() {
        line->UpdatePositions(std::move(wire_positions));
        line->UpdateIndices(std::move(wire_indices));
        auto line_node = make_unique<SceneNode>();
        auto shader = std::make_shared<SimpleShader>();
        line_node->CreateComponent<ShadingComponent>(shader);
        auto& rc = line_node->CreateComponent<RenderingComponent>(line);
        rc.SetDrawMode(DrawMode::Lines);
        glm::vec3 color(1.f, 1.f, 1.f);
        auto material = std::make_shared<Material>(color, color, color, 0);
        line_node->CreateComponent<MaterialComponent>(material);
        AddChild(std::move(line_node));
    }

    
    void InitializeFlex() {
        float rest_length = 4.0/n;
        float k = n*4;

        for (int i=0; i<n-2; i++) {
            for (int j=0; j<n-2; j++) {
                int current_ind = IndexOf(i, j);
                int right_ind = IndexOf(i, j+2);
                int bot_ind = IndexOf(i+2, j);
                system.AddSpring(current_ind, right_ind, k, rest_length);
                system.AddSpring(current_ind, bot_ind, k, rest_length);
            }
        }

        // for last two rows, connect vertical springs
        for (int i=n-2; i<n; i++) {
            for (int j=0; j<n-2; j++) {
                int current_ind = IndexOf(i, j);
                int bot_ind = IndexOf(i, j+2);
                system.AddSpring(current_ind, bot_ind, k, rest_length);
            }
        }
        // for last column, connect horizontal springs
        for (int j=n-2; j<n; j++) {
            for (int i=0; i<n-2; i++) {
                int current_ind = IndexOf(i, j);
                int right_ind = IndexOf(i+2, j);
                system.AddSpring(current_ind, right_ind, k, rest_length);
            }
        }
    }

    void InitializeShear() {
        float rest_length = sqrt(2) * 2.0 / n;
        float k = n*3;

        for (int i=0; i<n-1; i++) {
            // go bottom right
            for (int j=0; j<n-1; j++) {
                int current_ind = IndexOf(i, j);
                int bot_right_ind = IndexOf(i+1, j+1);
                system.AddSpring(current_ind, bot_right_ind, k, rest_length);
            }
            // go bottom left
            for (int j=1; j<n; j++) {
                int current_ind = IndexOf(i, j);
                int bot_left_ind = IndexOf(i+1, j-1);
                system.AddSpring(current_ind, bot_left_ind, k, rest_length);
            }
        }
    }

    void UpdateWireFrame() {
        wire_positions = make_unique<PositionArray>();
        wire_indices = make_unique<IndexArray>();
        std::vector<std::vector<glm::vec3>> connections = system.connections;
        auto state_positions = state.positions;
        for (int i=0; i<connections.size(); i++) {
            auto from_particle_position = state_positions[i];
            auto from_particle_index = wire_positions->size();
            auto list_of_connections = connections[i];
            wire_positions->push_back(from_particle_position);
            for (int j=0; j<list_of_connections.size(); j++) {
                auto other_particle_state_index = list_of_connections[j][0];
                auto to_particle_position = state_positions[other_particle_state_index];
                wire_positions->push_back(to_particle_position);
                wire_indices->push_back(from_particle_index);
                wire_indices->push_back(from_particle_index+j+1);
            }
        }
        line->UpdatePositions(std::move(wire_positions));
        line->UpdateIndices(std::move(wire_indices));
    }

    int n;
    float mass = 1.8f;
    PendulumSystem system;
    ParticleState state;
    std::unique_ptr<IntegratorBase<PendulumSystem, ParticleState>> integrator;
    float numSteps;
    float time;
    std::vector<SceneNode*> particle_node_ptrs;
    std::unique_ptr<GLOO::PositionArray> wire_positions = make_unique<PositionArray>();
    std::unique_ptr<GLOO::IndexArray> wire_indices = make_unique<IndexArray>();
    std::shared_ptr<GLOO::VertexObject> line = std::make_shared<VertexObject>();
        
};
}

#endif