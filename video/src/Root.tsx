import { Composition } from "remotion";
import { AILearningOSDemo } from "./AILearningOS/AILearningOSDemo";

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="AILearningOSDemo"
                component={AILearningOSDemo}
                durationInFrames={600}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
