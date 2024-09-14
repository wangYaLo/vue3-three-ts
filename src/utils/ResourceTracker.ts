
import * as THREE from 'three'
class ResourceTracker {
    private resources: Set<any>;
    constructor() {
        this.resources = new Set();
    }
    track(resource: any) {
        if (!resource) {
            return resource
        }
        if (Array.isArray(resource)) {
            resource.forEach(resource => this.track(resource));
            return resource;
        }

        if (resource.dispose || resource instanceof THREE.Object3D) {
            this.resources.add(resource);
        }
        if (resource instanceof THREE.Object3D) {
            this.track(resource.geometry);
            this.track(resource.material);
            this.track(resource.children);
        }
        return resource
    }
    untrack(resource: any) {
        this.resources.delete(resource);
    }
    dispose(): void {
        console.log(this.resources)
        for (const resource of this.resources) {
            if (resource instanceof THREE.Object3D) {
                console.log(resource)
                if (resource.parent) {
                    resource.parent.remove(resource);
                }
            }
            if (resource.dispose) {
                resource.dispose();
            }
        }
        this.resources.clear();
    }
}

export default ResourceTracker;