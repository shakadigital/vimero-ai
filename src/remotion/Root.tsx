import { Composition } from 'remotion';
import { VerticalVideo } from './VerticalVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VerticalVideo"
        component={VerticalVideo}
        durationInFrames={300} // Default, akan dioverride di Player
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          audioUrl: null,
          subtitleData: null,
          mediaAssets: [],
          title: 'Draft Konten',
          fullText: ''
        }}
      />
    </>
  );
};
